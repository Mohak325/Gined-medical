"""Turn Tamil Nadu's allotment lists into plain CSV files.

Usage: python -I scripts/data/tn_extract.py data/raw/states/tn.json data/raw/states/pdfs data/extracted/states

These ranks are Tamil Nadu's own, not All India ranks, and the government and management quotas
have separate rank lists. Names and application numbers are never written. The application number
is used while this runs, to spot a student who only kept the same seat as in an earlier round.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]
ALLOTTED = re.compile(r"^([A-Z0-9.]+)\s*(MBBS|BDS)\s*\(([^)]*)\)\s*_\s*(.+)$")


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def rows_of(doc):
    for page in doc:
        for table in page.find_tables().tables:
            for row in table.extract():
                cells = [clean(c) for c in row]
                if len(cells) > 5 and cells[0].isdigit():
                    yield cells


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report, colleges, held = {}, Counter(), {}
    for source in sources:
        name = f"TN-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, kept, unread, last, gaps = [], 0, 0, 0, 0, 0
        statuses = Counter()
        for cells in rows_of(doc):
            seen += 1
            if int(cells[0]) != last + 1:
                gaps += 1
            last = int(cells[0])
            government = source["quota"] == "GQ"
            # Government lists add a community column. Later rounds show a seat "from" and a seat "to",
            # so the last seat in the row is the one allotted, followed by its category and a status.
            community = cells[4] if government else ""
            positions = [i for i, c in enumerate(cells) if ALLOTTED.match(c)]
            if not positions or not cells[1].isdigit():
                unread += 1
                continue
            position = positions[-1]
            match = ALLOTTED.match(cells[position])
            after = cells[position + 1:]
            category = after[0] if after else ""
            status = after[1] if len(after) > 1 else ""
            statuses[status] += 1
            seat = (match.group(2), match.group(3), match.group(4), category)
            key = (source["quota"], cells[2])
            if status == "Retained" or held.get(key) == seat:
                held[key] = seat
                kept += 1
                continue
            held[key] = seat
            if match.group(2) == "MBBS":
                colleges[match.group(4)] += 1
            out.append({"rank": cells[1], "college": match.group(4), "course": match.group(2), "category": category,
                        "seat": match.group(3), "quota": match.group(1), "gender": "", "remark": community})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        mbbs = [r for r in out if r["course"] == "MBBS"]
        report[name] = {"pages": len(doc), "seen": seen, "written": len(out), "kept": kept, "unread": unread, "serialGaps": gaps,
                        "mbbs": len(mbbs), "statuses": dict(statuses), "quotas": dict(Counter(r["quota"] for r in mbbs)), "seats": dict(Counter(r["seat"] for r in mbbs)),
                        "categories": dict(Counter(r["category"] for r in mbbs).most_common(30)),
                        "communities": dict(Counter(r["remark"] for r in mbbs).most_common(30))}
        print(name, json.dumps({k: report[name][k] for k in ("pages", "seen", "written", "kept", "unread", "serialGaps", "mbbs", "statuses", "quotas", "seats", "categories", "communities")}), flush=True)
    with open(os.path.join(out_dir, "tn-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"files": report, "collegeNames": dict(sorted(colleges.items()))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
