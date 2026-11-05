"""Turn MCC allotment-result PDFs into plain CSV files.

Usage: python -I scripts/data/mcc_extract.py <pdf folder> <output folder>
Needs:  pip install pymupdf

Each PDF lists students by rank. MCC uses two table layouts:

  single round (Round 1, stray, special stray):
      SNo, Rank, Quota, Institute, Course, Allotted category, Candidate category, Remarks

  multi round (Round 2, Round 3):
      [SNo], Rank, <4 columns per earlier round>,
      Quota, Institute, Course, Allotted category, Candidate category, Option no., Remarks

In the multi-round layout only the last seven columns are about this round. A "-" there
means the student received nothing new this round, so that row is counted but not written.

The report records every row that could not be read, so nothing is dropped silently.
"""
import csv
import glob
import json
import os
import re
import sys
from collections import Counter
from concurrent.futures import ProcessPoolExecutor

import fitz

COURSES = ("MBBS", "BDS", "B.Sc", "BSc")
FIELDS = ["rank", "quota", "institute", "course", "allottedCategory", "candidateCategory", "remarks", "page"]


def clean(cell):
    return re.sub(r"\s+", " ", (cell or "").replace("\x00", "")).strip()


def is_number(text):
    # Ranks aren't always whole numbers: 2025 has a rank of 13767.5.
    return bool(re.fullmatch(r"\d+(\.\d+)?", text))


def is_header(cells):
    joined = " ".join(cells)
    return not is_number(cells[0]) and bool(re.search(r"\bRank\b|\bRound\b|NEET-UG|SNo|Allotted Quota", joined))


def drop_empty_columns(rows):
    """Table detection sometimes adds a column that is empty in every row."""
    data = [r for r in rows if not is_header(r)]
    if not data:
        return data
    keep = [i for i in range(len(data[0])) if any(r[i] for r in data)]
    return [[r[i] for i in keep] for r in data]


def parse_row(cells, multi):
    """Return (sno, rank, fields). Rank is None on a row continued from the previous page."""
    width = 7 if multi else 6
    if len(cells) < width + 1:
        return None
    tail = cells[-width:]
    head = cells[:-width]
    sno, rank = None, None
    if head[0] and is_number(head[0]):
        if len(head) > 1 and is_number(head[1]):
            sno, rank = int(float(head[0])), float(head[1])
        else:
            rank = float(head[0])
    elif head[0]:
        return None
    if multi:
        quota, institute, course, allotted, candidate, _option, remarks = tail
    else:
        quota, institute, course, allotted, candidate, remarks = tail
    return sno, rank, dict(
        quota=quota, institute=institute, course=course,
        allottedCategory=allotted, candidateCategory=candidate, remarks=remarks,
    )


def extract(job):
    path, out_dir = job
    name = os.path.splitext(os.path.basename(path))[0]
    multi = bool(re.search(r"-r[23]$", name))
    doc = fitz.open(path)
    rows, rejects = [], []
    report = Counter()
    remarks = Counter()
    last_sno, last_rank = None, None
    sno_gaps, rank_drops = [], []
    previous = None

    # Pages 1 and 2 explain the abbreviations. Results start on page 3.
    for page_index in range(2, len(doc)):
        page = doc[page_index]
        tables = page.find_tables().tables
        if not tables:
            report["pagesWithoutTable"] += 1
            continue
        for table in tables:
            raw = [[clean(c) for c in row] for row in table.extract()]
            for cells in drop_empty_columns(raw):
                parsed = parse_row(cells, multi)
                if parsed is None:
                    rejects.append({"page": page_index + 1, "cells": cells})
                    continue
                sno, rank, fields = parsed
                if rank is None:
                    # This row carries on from the bottom of the previous page.
                    if previous is None:
                        rejects.append({"page": page_index + 1, "cells": cells})
                        continue
                    for key, value in fields.items():
                        if value and value != "-":
                            previous[key] = (previous[key] + " " + value).strip()
                    report["continuationRows"] += 1
                    continue
                report["rowsSeen"] += 1
                if sno is not None:
                    if last_sno is not None and sno != last_sno + 1:
                        sno_gaps.append([last_sno, sno])
                    last_sno = sno
                if last_rank is not None and rank < last_rank:
                    rank_drops.append([last_rank, rank])
                last_rank = rank
                fields.update(rank=int(rank) if rank == int(rank) else rank, page=page_index + 1)
                previous = fields
                rows.append(fields)

    written = 0
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            if row["quota"] in ("", "-") or row["institute"] in ("", "-"):
                report["noAllotmentThisRound"] += 1
                continue
            if not row["course"].startswith(COURSES):
                rejects.append({"page": row["page"], "cells": list(row.values())})
                continue
            remarks[re.sub(r"\s*\(.*", "", row["remarks"])] += 1
            writer.writerow(row)
            written += 1

    return name, dict(
        pages=len(doc), written=written, rejected=len(rejects), **report,
        lastRank=last_rank, lastSno=last_sno,
        snoGaps=sno_gaps[:20], snoGapCount=len(sno_gaps),
        rankDrops=rank_drops[:20], rankDropCount=len(rank_drops),
        remarks=dict(remarks.most_common()), rejectSamples=rejects[:15],
    )


def main():
    pdf_dir, out_dir = sys.argv[1], sys.argv[2]
    paths = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))
    with ProcessPoolExecutor(max_workers=max(2, (os.cpu_count() or 4) - 2)) as pool:
        results = dict(pool.map(extract, [(p, out_dir) for p in paths]))
    with open(os.path.join(out_dir, "extract-report.json"), "w", encoding="utf-8") as handle:
        json.dump(results, handle, indent=2, ensure_ascii=False)
    for name, result in sorted(results.items()):
        print(name, "pages", result["pages"], "written", result["written"], "rejected", result["rejected"],
              "snoGaps", result["snoGapCount"], "rankDrops", result["rankDropCount"])


if __name__ == "__main__":
    main()
