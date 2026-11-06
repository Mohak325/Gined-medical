"""Turn Puducherry's CENTAC allotment lists into plain CSV files.

Usage: python -I scripts/data/py_extract.py data/raw/states/py.json data/raw/states/pdfs data/extracted/states

Each block of rows sits under a heading such as "GOVERNMENT QUOTA - U.T. - <college> - [M.B.B.S.]",
which gives the quota, college and course. Only the All India rank, allotted category and status
are read from the rows. Application numbers and names are never written.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]
HEADING = re.compile(r"^(.*?QUOTA.*?|.*?NRI.*?|.*?SELF.?SUPPORTING.*?) - (.+) - \[(.+)\]$", re.I)


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report = {}
    for source in sources:
        name = f"PY-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, unplaced = [], 0
        heading = None
        for page in doc:
            headings = []
            for block in page.get_text("blocks"):
                text = re.sub(r"\s*DATE\s*:.*$", "", clean(block[4]))
                for part in re.split(r"(?=(?:GOVERNMENT|MANAGEMENT|NRI|SELF|NATIONAL|INSTITUTIONAL|MINORITY)[A-Z .()-]*QUOTA)", text):
                    match = HEADING.match(part.strip())
                    if match:
                        headings.append((block[1], match.groups()))
            items = [(y, "heading", groups) for y, groups in headings]
            for table in page.find_tables().tables:
                items.append((table.bbox[1], "table", table))
            for _y, kind, item in sorted(items, key=lambda entry: entry[0]):
                if kind == "heading":
                    heading = item
                    continue
                for row in item.extract():
                    cells = [clean(c) for c in row]
                    if len(cells) < 9 or not cells[0].isdigit():
                        continue
                    if heading is None:
                        unplaced += 1
                        continue
                    quota, college, course = heading
                    out.append({"rank": cells[3], "college": college, "course": "MBBS" if "M.B.B.S" in course.upper() else course,
                                "category": cells[7], "seat": cells[6], "quota": quota, "gender": "", "remark": cells[8]})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        mbbs = [r for r in out if r["course"] == "MBBS"]
        report[name] = {"pages": len(doc), "rows": len(out), "unplaced": unplaced, "mbbs": len(mbbs),
                        "badRank": sum(not r["rank"].isdigit() for r in out),
                        "quotas": dict(Counter(r["quota"] for r in mbbs)), "categories": dict(Counter(r["category"] for r in mbbs).most_common(30)),
                        "statuses": dict(Counter(r["remark"] for r in mbbs)), "colleges": dict(Counter(r["college"] for r in mbbs))}
        print(name, json.dumps(report[name], ensure_ascii=False), flush=True)
    with open(os.path.join(out_dir, "py-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
