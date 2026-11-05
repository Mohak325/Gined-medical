"""Turn Andhra Pradesh's college-wise allotment PDFs into plain CSV files.

Usage: python -I scripts/data/ap_extract.py data/raw/states/ap.json data/raw/states/pdfs data/extracted/states

Each row ends with a seat code such as "ACSR - MBBS - UR - OC - G --- 6" and the phase.
Rows hold student names, so only the rank, seat code and phase are ever read out.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark", "phase"]
# The code ends in a seat's option number after dashes, written as "--- 6" or "-- - 1".
SEAT = re.compile(r"^([A-Z0-9&]+)\s*-\s*(MBBS|BDS)\s*-\s*(.+?)\s*-\s*-[\s-]*\d+$")


def clean(cell):
    return re.sub(r"\s+", " ", (cell or "")).strip()


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report, names = {}, {}
    for source in sources:
        name = f"AP-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        rows, unread, heading = [], 0, None
        for page in doc:
            for table in page.find_tables().tables:
                for raw in table.extract():
                    cells = [clean(c) for c in raw]
                    filled = [c for c in cells if c]
                    if len(filled) == 1 and re.search(r"college|institute|medical|sciences", filled[0], re.I) and "University of Health" not in filled[0]:
                        heading = filled[0]
                        continue
                    if len(cells) < 10 or not re.fullmatch(r"\d+", cells[0]):
                        continue
                    match = SEAT.match(cells[8])
                    if not re.fullmatch(r"\d+", cells[1]) or not match:
                        unread += 1
                        continue
                    if heading:
                        names.setdefault(match.group(1), heading)
                    rows.append({"rank": cells[1], "college": match.group(1), "course": match.group(2), "category": match.group(3),
                                 "seat": "", "quota": source["quota"], "gender": "", "remark": "", "phase": cells[9]})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(rows)
        report[name] = {"pages": len(doc), "written": len(rows), "rejected": unread,
                        "phases": dict(Counter(r["phase"] for r in rows)), "colleges": len({r["college"] for r in rows})}
        print(name, json.dumps(report[name]))
    with open(os.path.join(out_dir, "ap-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"files": report, "collegeNames": dict(sorted(names.items()))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
