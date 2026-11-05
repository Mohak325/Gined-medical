"""Turn state counselling allotment PDFs into plain CSV files.

Usage: python -I scripts/data/state_extract.py data/raw/states/sources.json data/raw/states/pdfs data/extracted/states

Each entry in sources.json names the state, the file, and which column heading holds each
field. Many state lists include student names, roll numbers and application numbers.
This script only ever writes the fields below, so that personal data can't reach the repo.

The report records every row that could not be read, so nothing is dropped silently.
"""
import csv
import json
import os
import re
import sys
from collections import Counter
from concurrent.futures import ProcessPoolExecutor

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]


def clean(cell):
    return re.sub(r"\s+", " ", (cell or "").replace("\x00", "")).strip()


def squash(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def find_header(rows, columns):
    """Returns the heading row's position and each field's column, if the table has one."""
    wanted = {field: squash(name) for field, name in columns.items()}
    for index, row in enumerate(rows[:4]):
        cells = [squash(c) for c in row]
        # Headings wrap and vary, so a heading only has to start with the name given.
        found = {}
        for field, name in wanted.items():
            for position, cell in enumerate(cells):
                if cell.startswith(name):
                    found[field] = position
                    break
        if "rank" in found and "college" in found:
            return index, found
    return None, None


def extract(job):
    source, pdf_dir, out_dir = job
    name = f"{source['state']}-{source['name']}"
    doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
    rows, rejects = [], []
    report = Counter()
    mapping, width = None, None

    for page_index in range(len(doc)):
        for table in doc[page_index].find_tables().tables:
            raw = [[clean(c) for c in row] for row in table.extract()]
            header_at, found = find_header(raw, source["columns"])
            if found:
                mapping, width, body = found, len(raw[header_at]), raw[header_at + 1:]
            elif mapping and len(raw[0]) == width:
                body = raw  # A table carrying on with no heading of its own.
            else:
                report["tablesSkipped"] += 1
                continue
            for cells in body:
                if not any(cells):
                    continue
                rank = cells[mapping["rank"]].replace(",", "")
                college = cells[mapping["college"]]
                if not re.fullmatch(r"\d+(\.\d+)?", rank) or not college:
                    # Never store the row itself: it may hold a student's name.
                    rejects.append({"page": page_index + 1, "filled": sum(1 for c in cells if c)})
                    continue
                row = {"rank": rank, "college": college}
                for field in ("course", "category", "seat", "quota", "gender", "remark"):
                    row[field] = cells[mapping[field]] if field in mapping else ""
                rows.append(row)

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    tally = lambda field: dict(Counter(re.sub(r"\s*\(.*", "", r[field])[:40] for r in rows).most_common(40))
    return name, dict(
        pages=len(doc), written=len(rows), rejected=len(rejects), **report,
        colleges=len({r["college"] for r in rows}), categories=tally("category"),
        courses=tally("course"), seats=tally("seat"), quotas=tally("quota"), genders=tally("gender"), remarks=tally("remark"),
        rejectSamples=rejects[:10],
    )


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    with ProcessPoolExecutor(max_workers=max(2, (os.cpu_count() or 4) - 2)) as pool:
        results = dict(pool.map(extract, [(s, pdf_dir, out_dir) for s in sources]))
    with open(os.path.join(out_dir, "extract-report.json"), "w", encoding="utf-8") as handle:
        json.dump(results, handle, indent=2, ensure_ascii=False)
    for name, r in sorted(results.items()):
        print(name, "pages", r["pages"], "written", r["written"], "rejected", r["rejected"], "colleges", r["colleges"], "skipped", r.get("tablesSkipped", 0))


if __name__ == "__main__":
    main()
