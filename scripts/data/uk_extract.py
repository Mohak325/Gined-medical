"""Turn Uttarakhand's NEET UG broadsheets into plain CSV files.

Usage: python -I scripts/data/uk_extract.py data/raw/states/uk.json data/raw/states/pdfs data/extracted/states

Only the All India rank and the allotted quota, category and college are read, found by their
headings. Names, roll numbers, marks and school details are never written. Each student's choice
list runs over several rows, and only the first row holds the student's details. In Rounds 2 and 3,
a student whose allotted seat matches their previous round's seat only kept it.
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


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report = {}
    for source in sources:
        name = f"UK-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, kept, none = [], 0, 0, 0
        col = None
        for page in doc:
            for table in page.find_tables().tables:
                for row in table.extract():
                    cells = [clean(c) for c in row]
                    if "Neet AIR" in cells:
                        col = {"rank": cells.index("Neet AIR"), "quota": cells.index("Alloted Quota"),
                               "category": cells.index("Alloted Category"), "college": cells.index("Alloted College"),
                               "remark": cells.index("Remark"),
                               "previous": cells.index("Previous Round Allotment") if "Previous Round Allotment" in cells else None}
                        continue
                    if col is None or len(cells) <= col["remark"] or not cells[0].isdigit():
                        continue
                    seen += 1
                    college = cells[col["college"]]
                    if not college:
                        none += 1
                        continue
                    category = cells[col["category"]]
                    if col["previous"] is not None:
                        # The three cells under "Previous Round Allotment" are category, college and quota.
                        previous_category, previous_college = cells[col["previous"]], cells[col["previous"] + 1]
                        if previous_college and previous_college == college and previous_category == category:
                            kept += 1
                            continue
                    out.append({"rank": cells[col["rank"]], "college": college,
                                "course": "BDS" if re.search(r"dental", college, re.I) else "MBBS", "category": category, "seat": "",
                                "quota": cells[col["quota"]], "gender": "", "remark": cells[col["remark"]]})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        mbbs = [r for r in out if r["course"] == "MBBS"]
        report[name] = {"pages": len(doc), "students": seen, "written": len(out), "kept": kept, "noSeat": none, "mbbs": len(mbbs),
                        "badRank": sum(not r["rank"].isdigit() for r in out), "quotas": dict(Counter(r["quota"] for r in mbbs)),
                        "categories": dict(Counter(r["category"] for r in mbbs).most_common(40)), "colleges": dict(Counter(r["college"] for r in out))}
        print(name, json.dumps({k: v for k, v in report[name].items() if k != "colleges"}), flush=True)
    with open(os.path.join(out_dir, "uk-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
