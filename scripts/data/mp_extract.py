"""Turn Madhya Pradesh's allotment lists into plain CSV files.

Usage: python -I scripts/data/mp_extract.py data/raw/states/mp.json data/raw/states/pdfs data/extracted/states

Only the rank, college, seat, domicile and status columns are read. Roll numbers and names never
leave this script. Each round also has an official closing rank table (MP-<name>-summary.pdf),
which is saved to the report so that data:check can compare it with our own calculation.
Column order changes between rounds, so columns are found by their headings.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]


def key(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def rows_of(path, marker):
    header = None
    for page in fitz.open(path):
        for table in page.find_tables().tables:
            for row in table.extract():
                cells = [re.sub(r"\s+", " ", c or "").strip() for c in row]
                keys = [key(c) for c in cells]
                if marker in keys:
                    header = keys
                    continue
                if header and len(cells) == len(header) and cells[0].isdigit():
                    yield dict(zip(header, cells))


def find(row, *names):
    return next((row[n] for n in names if n in row), "")


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report, colleges = {}, Counter()
    for source in sources:
        name = f"MP-{source['name']}"
        out, seen, none, last, gaps = [], 0, 0, 0, 0
        extra = Counter()
        for row in rows_of(os.path.join(pdf_dir, name + ".pdf"), "allottedcollege"):
            seen += 1
            serial = int(next(iter(row.values())))
            if serial != last + 1:
                gaps += 1
            last = serial
            college = find(row, "allottedcollege")
            # Any heading besides the known ones says how a seat came about. Keep the words for review.
            status = find(row, "allotmentstatus", "status", "needtoreportstatus", "needtoreport", "remark", "remarks")
            extra[status] += 1
            if not college or college == "NOT ALLOTTED":
                none += 1
                continue
            colleges[college] += 1
            out.append({"rank": find(row, "neetug2026airank"), "college": college, "course": find(row, "allottedcourse"),
                        "category": find(row, "allottedcategoryclass"), "seat": find(row, "allottedinstitutetype"),
                        "quota": "", "gender": "", "remark": status})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        summary = []
        for row in rows_of(os.path.join(pdf_dir, name + "-summary.pdf"), "closingairank"):
            if find(row, "course") == "MBBS":
                summary.append({"college": find(row, "instname"), "closing": int(find(row, "closingairank")), "seat": find(row, "allottedcategoryclass"),
                                "allotted": int(find(row, "totalallotted")), "report": find(row, "needtoreportstatus")})
        report[name] = {"seen": seen, "written": len(out), "notAllotted": none, "serialGaps": gaps, "statuses": dict(extra),
                        "courses": dict(Counter(r["course"] for r in out)), "summary": summary}
        print(name, json.dumps({k: report[name][k] for k in ("seen", "written", "notAllotted", "serialGaps", "statuses", "courses")}), "summary rows", len(summary), flush=True)
    with open(os.path.join(out_dir, "mp-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"files": report, "collegeNames": dict(sorted(colleges.items()))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
