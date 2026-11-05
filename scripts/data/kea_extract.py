"""Turn Karnataka (KEA) medical allotment PDFs into plain CSV files.

Usage: python -I scripts/data/kea_extract.py <pdf folder> <output folder>
Needs:  pip install pymupdf

KEA's table has these columns. Round 1 of 2025 has no Status column.

    SL.NO, All India Rank, Course Code, College, Course Name, Allotted Category, Course fees, Status

The lists hold no student names. The report records every row that could not be read,
so nothing is dropped silently.
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

FIELDS = ["sno", "rank", "code", "college", "course", "category", "fee", "status", "page"]


def clean(cell):
    return re.sub(r"\s+", " ", (cell or "").replace("\x00", "")).strip()


def is_number(text):
    return bool(re.fullmatch(r"\d+(\.\d+)?", text))


def extract(job):
    path, out_dir = job
    name = os.path.splitext(os.path.basename(path))[0]
    doc = fitz.open(path)
    rows, rejects = [], []
    report = Counter()
    statuses = Counter()
    last_sno, last_rank = None, None
    sno_gaps, rank_drops = [], []

    for page_index in range(len(doc)):
        tables = doc[page_index].find_tables().tables
        if not tables:
            report["pagesWithoutTable"] += 1
            continue
        for table in tables:
            for raw in table.extract():
                cells = [clean(c) for c in raw]
                if not any(cells) or cells[0].upper().startswith("SL"):
                    continue
                if not cells[0] and rows:
                    # This row carries on from the bottom of the previous page.
                    previous = rows[-1]
                    if len(cells) > 3 and cells[3]:
                        previous["college"] = (previous["college"] + " " + cells[3]).strip()
                    if len(cells) > 7 and cells[7]:
                        previous["status"] = (previous["status"] + " " + cells[7]).strip()
                    report["continuationRows"] += 1
                    continue
                if len(cells) < 7 or not is_number(cells[0]) or not is_number(cells[1]) or not cells[2]:
                    rejects.append({"page": page_index + 1, "cells": cells})
                    continue
                sno, rank = int(cells[0]), float(cells[1])
                if last_sno is not None and sno != last_sno + 1:
                    sno_gaps.append([last_sno, sno])
                last_sno = sno
                if last_rank is not None and rank < last_rank:
                    rank_drops.append([last_rank, rank])
                last_rank = rank
                rows.append(dict(
                    sno=sno, rank=int(rank) if rank == int(rank) else rank, code=cells[2], college=cells[3],
                    course=cells[4], category=cells[5], fee=cells[6],
                    status=cells[7] if len(cells) > 7 else "", page=page_index + 1,
                ))

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            statuses[row["status"]] += 1
            writer.writerow(row)

    return name, dict(
        pages=len(doc), written=len(rows), rejected=len(rejects), **report, lastRank=last_rank, lastSno=last_sno,
        snoGaps=sno_gaps[:20], snoGapCount=len(sno_gaps), rankDrops=rank_drops[:20], rankDropCount=len(rank_drops),
        statuses=dict(statuses.most_common()), rejectSamples=rejects[:15],
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
              "snoGaps", result["snoGapCount"], "rankDrops", result["rankDropCount"], result["statuses"])


if __name__ == "__main__":
    main()
