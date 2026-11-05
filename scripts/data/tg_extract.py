"""Turn Telangana's (KNRUHS) college-wise allotment PDFs into plain CSV files.

Usage: python -I scripts/data/tg_extract.py data/raw/states/tg.json data/raw/states/pdfs data/extracted/states

The lists have no ruled table. Each student's line starts with a rank and a 10-digit ticket number,
and ends with a seat tag such as OPEN-GEN-P1. Names sit between, and are never read into a row.
A "COLL" heading names the college, and a "CRS" heading names the course.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]
TAG = re.compile(r"^[A-Z0-9]+(?:-[A-Z0-9]+)*-(?:P\d|M\d?|MU|MOP|MOPUP|S\d?|SV|STRAY)$")


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report = {}
    for source in sources:
        name = f"TG-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        rows, unread, college, course = [], 0, "", ""
        for page in doc:
            lines = {}
            for x0, y0, _x1, _y1, text, *_ in page.get_text("words"):
                lines.setdefault(round(y0 / 2), []).append((x0, text))
            for key in sorted(lines):
                words = [t for _x, t in sorted(lines[key])]
                if "COLL" in words:
                    # The heading reads "COLL :: OMCH - OSMANIA MEDICAL COLLEGE" or "COLL :: APLO(041) - ...".
                    code = next((w for w in words[words.index("COLL") + 1:] if re.match(r"^[A-Z]{3,5}(\(\d+\))?$", w)), "")
                    college = re.sub(r"\(.*", "", code)
                if "CRS" in words:
                    joined = " ".join(words)
                    course = "BDS" if "BDS" in joined else "MBBS" if "MBBS" in joined else course
                if len(words) >= 3 and re.fullmatch(r"\d+", words[0]) and re.fullmatch(r"\d{10}", words[1]):
                    tag = words[-1]
                    if not TAG.match(tag):
                        unread += 1
                        continue
                    gender = next((w for w in reversed(words[2:-1]) if w in ("M", "F")), "")
                    cat = next((w for w in reversed(words[2:-1]) if re.fullmatch(r"OC|EWS|BC[A-E]|SC(?:-[ABC]|[ABC123])?|ST", w)), "")
                    rows.append({"rank": words[0], "college": college, "course": course, "category": tag, "seat": cat,
                                 "quota": source["quota"], "gender": gender, "remark": ""})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(rows)
        report[name] = {"pages": len(doc), "written": len(rows), "rejected": unread, "colleges": len({r["college"] for r in rows}),
                        "courses": dict(Counter(r["course"] for r in rows)),
                        "tags": dict(Counter(re.sub(r"-[^-]+$", "", r["category"]) for r in rows).most_common(60)),
                        "phases": dict(Counter(r["category"].rsplit("-", 1)[-1] for r in rows))}
        print(name, json.dumps({k: report[name][k] for k in ("pages", "written", "rejected", "colleges", "courses", "phases")}))
    with open(os.path.join(out_dir, "tg-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)


if __name__ == "__main__":
    main()
