"""Turn MCC's NEET PG allotment-result PDFs into plain CSV files.

Usage: python -I scripts/data/mcc_pg_extract.py <pdf folder> <output folder>
Needs:  pip install pymupdf

Reads the single-round layout used by Round 1 and the stray round:

    SNo, Rank, Allotted Quota, Allotted Institute, Course, Allotted Category, Candidate Category[, Remarks]

2026 Round 1 has no Remarks column. Columns are found from the header row on each page,
so either form works.

Rounds 2 and 3 use a wider layout: each row is one rank, then the seat it held in every
earlier round (4 columns per round), then this round's 7 columns:

    Rank, [earlier rounds...], Allotted Quota, Allotted Institute, Course,
    Allotted Category, Candidate Category, Option No., Remarks

Only this round's columns are kept. They are read from the right, because the header
row isn't repeated and its merged cells shift the column count on the first page.

MCC's PG lists hold no names or roll numbers, only ranks. The report records every row
that could not be read, so nothing is dropped silently.
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

FIELDS = ["rank", "quota", "institute", "course", "allottedCategory", "candidateCategory", "remarks", "page"]
HEADERS = {
    "sno": r"^S\.?\s*No",
    "rank": r"^Rank$",
    "quota": r"Al+ot+ed Quota",
    "institute": r"Al+ot+ed Institute",
    "course": r"^Course$",
    "allottedCategory": r"Al+ot+ed Category",
    "candidateCategory": r"Candidate Category",
    "remarks": r"^Remarks$",
}


def clean(cell):
    return re.sub(r"\s+", " ", (cell or "").replace("\x00", "")).strip()


def is_number(text):
    return bool(re.fullmatch(r"\d+(\.\d+)?", text))


def header_columns(cells):
    found = {}
    for index, cell in enumerate(cells):
        for key, pattern in HEADERS.items():
            if key not in found and re.search(pattern, cell, re.I):
                found[key] = index
    return found if {"rank", "quota", "institute", "course", "allottedCategory"} <= found.keys() else None


def extract_pages(job):
    path, start, stop, wide = job
    doc = fitz.open(path)
    out = []
    for page_index in range(start, stop):
        tables = doc[page_index].find_tables().tables
        # Wide layout: a None cell is the empty half of a merged header cell, not a column.
        out.append((page_index, [
            [[clean(c) for c in row if not (wide and c is None)] for row in t.extract()] for t in tables
        ]))
    return out


LATEST = ["quota", "institute", "course", "allottedCategory", "candidateCategory", "option", "remarks"]


def read_wide(page_tables):
    """Rounds 2 and 3: keep the rank and this round's last 7 columns."""
    rows, rejects = [], []
    report = Counter()
    last_rank, rank_drops = None, []
    previous = None
    width = None
    for page_index, tables in page_tables:
        if not tables:
            report["pagesWithoutTable"] += 1
            continue
        for table in tables:
            for cells in table:
                if not any(cells):
                    continue
                if cells[0] == "Rank":
                    width = len(cells)
                    continue
                if width is None or re.search(r"^Round 1$|NEET-PG", cells[0]):
                    continue
                if len(cells) != width:
                    rejects.append({"page": page_index + 1, "cells": cells})
                    continue
                latest = dict(zip(LATEST, cells[-7:]))
                if not cells[0]:
                    # A row carried on from the bottom of the previous page.
                    if previous is None:
                        rejects.append({"page": page_index + 1, "cells": cells})
                        continue
                    for key, value in latest.items():
                        if key != "option" and value and value != "-":
                            previous[key] = (previous[key] + " " + value).strip()
                    report["continuationRows"] += 1
                    continue
                if not is_number(cells[0]):
                    rejects.append({"page": page_index + 1, "cells": cells})
                    continue
                report["rowsSeen"] += 1
                rank = int(float(cells[0]))
                if last_rank is not None and rank < last_rank:
                    rank_drops.append([last_rank, rank])
                last_rank = rank
                previous = {key: latest[key] for key in FIELDS if key in latest}
                previous.update(rank=rank, page=page_index + 1)
                rows.append(previous)
    return rows, rejects, report, last_rank, rank_drops


def extract(path, pool, wide):
    doc = fitz.open(path)
    pages = len(doc)
    doc.close()
    step = 60
    jobs = [(path, s, min(s + step, pages), wide) for s in range(1, pages, step)]
    page_tables = sorted((p for chunk in pool.map(extract_pages, jobs) for p in chunk), key=lambda p: p[0])

    if wide:
        rows, rejects, report, last_rank, rank_drops = read_wide(page_tables)
        return rows, rejects, dict(
            pages=pages, **report, lastRank=last_rank,
            rankDrops=rank_drops[:20], rankDropCount=len(rank_drops), snoGapCount=0,
        )

    columns = None
    rows, rejects = [], []
    report = Counter()
    last_sno, sno_gaps, last_rank, rank_drops = None, [], None, []
    previous = None
    for page_index, tables in page_tables:
        if not tables:
            report["pagesWithoutTable"] += 1
            continue
        for table in tables:
            for cells in table:
                header = header_columns(cells)
                if header:
                    columns = header
                    continue
                if columns is None or not any(cells):
                    continue
                if len(cells) <= max(columns.values()):
                    rejects.append({"page": page_index + 1, "cells": cells})
                    continue
                get = lambda key: cells[columns[key]] if key in columns else ""
                rank_text = get("rank")
                if not rank_text:
                    # A row carried on from the bottom of the previous page.
                    if previous is None or is_number(get("sno")):
                        rejects.append({"page": page_index + 1, "cells": cells})
                        continue
                    for key in ("quota", "institute", "course", "allottedCategory", "candidateCategory", "remarks"):
                        value = get(key)
                        if value and value != "-":
                            previous[key] = (previous[key] + " " + value).strip()
                    report["continuationRows"] += 1
                    continue
                if not is_number(rank_text):
                    if re.search(r"NEET-PG|Round", " ".join(cells)):
                        continue
                    rejects.append({"page": page_index + 1, "cells": cells})
                    continue
                report["rowsSeen"] += 1
                sno = get("sno")
                if is_number(sno):
                    sno = int(float(sno))
                    if last_sno is not None and sno != last_sno + 1:
                        sno_gaps.append([last_sno, sno])
                    last_sno = sno
                rank = float(rank_text)
                if last_rank is not None and rank < last_rank:
                    rank_drops.append([last_rank, rank])
                last_rank = rank
                previous = {key: get(key) for key in FIELDS if key not in ("rank", "page")}
                previous.update(rank=int(rank) if rank == int(rank) else rank, page=page_index + 1)
                rows.append(previous)

    return rows, rejects, dict(
        pages=pages, **report, lastRank=last_rank, lastSno=last_sno,
        snoGaps=sno_gaps[:20], snoGapCount=len(sno_gaps),
        rankDrops=rank_drops[:20], rankDropCount=len(rank_drops),
    )


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pdf_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    results = {}
    with ProcessPoolExecutor(max_workers=max(2, (os.cpu_count() or 4) - 2)) as pool:
        for path in sorted(glob.glob(os.path.join(pdf_dir, "*.pdf"))):
            name = os.path.splitext(os.path.basename(path))[0]
            if not re.search(r"-(r\d|stray)$", name):
                continue
            wide = bool(re.search(r"-r[2-9]$", name))
            rows, rejects, report = extract(path, pool, wide)
            written = 0
            remarks = Counter()
            with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=FIELDS)
                writer.writeheader()
                for row in rows:
                    if row["quota"] in ("", "-") or row["institute"] in ("", "-"):
                        report["noAllotment"] = report.get("noAllotment", 0) + 1
                        continue
                    remarks[row["remarks"]] += 1
                    writer.writerow(row)
                    written += 1
            report.update(written=written, rejected=len(rejects), remarks=dict(remarks.most_common()),
                          rejectSamples=rejects[:15])
            results[name] = report
            print(name, "pages", report["pages"], "written", written, "rejected", len(rejects),
                  "snoGaps", report["snoGapCount"], "rankDrops", report["rankDropCount"], flush=True)
    with open(os.path.join(out_dir, "extract-report.json"), "w", encoding="utf-8") as handle:
        json.dump(results, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
