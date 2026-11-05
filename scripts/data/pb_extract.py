"""Turn Punjab's allotment lists into plain CSV files.

Usage: python -I scripts/data/pb_extract.py data/raw/states/pb.json data/raw/states/pdfs data/extracted/states

The tables are ruled. Round 1 gives a NEET roll number and no rank, so the rank comes from the
merit list (PB-merit-r1.pdf), joined on roll number while this runs. Roll numbers and names are
never written. Later rounds print the rank, and a Status column separates new seats
("New Allotted", "Upgraded") from students who kept theirs ("No Change").
"""
import csv
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
    """Yield each data row as {heading: cell}, using the heading row on the same page or the last one."""
    header = None
    for page in doc:
        for table in page.find_tables().tables:
            for row in table.extract():
                cells = [clean(c) for c in row]
                keys = [key(c) for c in cells]
                if any("rollno" in k for k in keys) and any("college" in k or k == "neetrank" for k in keys):
                    header = keys
                    continue
                if header and len(cells) == len(header) and re.fullmatch(r"\d+", cells[0]):
                    yield dict(zip(header, cells))


def find(row, *names):
    return next((row[n] for n in names if n in row), "")


def merit_ranks(path):
    ranks = {}
    for row in rows_of(fitz.open(path)):
        roll, rank = find(row, "neetrollno", "neetugrollno"), find(row, "neetrank")
        if roll and re.fullmatch(r"\d+", rank):
            ranks[roll] = rank
    return ranks


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    # A few Round 1 students are only on the NRI list, or reappear in later rounds' lists.
    ranks = {}
    for extra in ["PB-merit-nri", "PB-2026-stray", "PB-2026-r3", "PB-2026-r2", "PB-merit-r1"]:
        ranks.update(merit_ranks(os.path.join(pdf_dir, extra + ".pdf")))
    report, colleges = {}, Counter()
    for source in sources:
        name = f"PB-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, kept, no_rank = [], 0, 0, 0
        statuses = Counter()
        for row in rows_of(doc):
            seen += 1
            status = find(row, "status")
            statuses[status] += 1
            college = find(row, "allottedcollege")
            if not college:
                kept += 1
                continue
            rank = find(row, "neetrank") or ranks.get(find(row, "neetrollno"), "")
            if not rank:
                no_rank += 1
                continue
            course = find(row, "allottedcourse") or ("B.D.S" if "dental" in college.lower() else "M.B.B.S.")
            colleges[college] += 1
            out.append({"rank": rank, "college": college, "course": course, "category": find(row, "allottedcategory"),
                        "seat": "", "quota": find(row, "allottedquota"), "gender": "", "remark": status})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        report[name] = {"pages": len(doc), "seen": seen, "written": len(out), "keptOrNone": kept, "noRank": no_rank, "statuses": dict(statuses),
                        "courses": dict(Counter(r["course"] for r in out)), "quotas": dict(Counter(r["quota"] for r in out)),
                        "categories": dict(Counter(r["category"] for r in out).most_common(60))}
        print(name, json.dumps({k: report[name][k] for k in ("pages", "seen", "written", "keptOrNone", "noRank", "statuses", "courses", "quotas")}))
    with open(os.path.join(out_dir, "pb-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"meritRanks": len(ranks), "files": report, "collegeNames": dict(sorted(colleges.items()))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
