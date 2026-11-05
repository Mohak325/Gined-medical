"""Turn Himachal Pradesh's seat allocation lists into plain CSV files.

Usage: python -I scripts/data/hp_extract.py data/raw/states/hp.json data/raw/states/pdfs data/extracted/states

Allocation lists give an application number and no rank. The merit lists (HP-merit-*.pdf) link
that number to the All India rank, and the link is only used while this runs. Names and
application numbers are never written. A student whose seat matches their seat in an earlier
round only kept it, so isn't counted as a new allotment.
"""
import csv
import glob
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def key(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def rows_of(doc):
    header = None
    for page in doc:
        for table in page.find_tables().tables:
            for row in table.extract():
                cells = [clean(c) for c in row]
                keys = [key(c) for c in cells]
                if any(k.startswith("application") for k in keys) and any(k.startswith("merit") for k in keys):
                    header = keys
                    continue
                if header and len(cells) == len(header) and re.fullmatch(r"\d+", cells[0]):
                    yield dict(zip(header, cells))


def find(row, *names):
    return next((row[n] for n in names if row.get(n)), "")


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    ranks, conflicts = {}, 0
    for path in sorted(glob.glob(os.path.join(pdf_dir, "HP-merit-*.pdf"))):
        for row in rows_of(fitz.open(path)):
            number = find(row, "applicationno")
            rank = next((v for k, v in row.items() if "allindia" in k or k == "neetrank"), "")
            if number and re.fullmatch(r"\d+", rank):
                if number in ranks and ranks[number] != rank:
                    conflicts += 1
                ranks[number] = rank
    report, colleges, held = {}, Counter(), {}
    for source in sources:
        name = f"HP-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, kept, no_rank = [], 0, 0, 0
        for row in rows_of(doc):
            seen += 1
            number = find(row, "applicationno")
            college = find(row, "institutename", "allottedcollege")
            quota = find(row, "allottedquota", "admissiontype", "admissionquota")
            category = find(row, "allottedcategory", "allottedseatcategory", "category")
            seat = (college, quota, category)
            if held.get(number) == seat:
                kept += 1
                continue
            held[number] = seat
            rank = ranks.get(number, "")
            if not rank:
                no_rank += 1
                continue
            colleges[college] += 1
            out.append({"rank": rank, "college": college, "course": "BDS" if "dental" in college.lower() else "MBBS",
                        "category": category, "seat": "", "quota": quota, "gender": "", "remark": ""})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        report[name] = {"pages": len(doc), "seen": seen, "written": len(out), "kept": kept, "noRank": no_rank,
                        "courses": dict(Counter(r["course"] for r in out)),
                        "labels": dict(Counter(f"{r['quota']} / {r['category']}" for r in out if r["course"] == "MBBS").most_common(50))}
        print(name, json.dumps({k: report[name][k] for k in ("pages", "seen", "written", "kept", "noRank", "courses")}))
    with open(os.path.join(out_dir, "hp-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"meritRanks": len(ranks), "rankConflicts": conflicts, "files": report, "collegeNames": dict(sorted(colleges.items()))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
