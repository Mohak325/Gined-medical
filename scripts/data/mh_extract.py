"""Turn Maharashtra's selection lists into plain CSV files.

Usage: python -I scripts/data/mh_extract.py data/raw/states/mh.json data/raw/states/pdfs data/extracted/states

The pages are printed sideways, so each student runs down the page: words sharing an x position
form one row, and y tells the column. Names sit between y 440 and 570 and are never read.
Rows with "Choice not available" got no seat in this round, and are counted but not written.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]
CODE = re.compile(r"^(\d{4}):(.*)$")


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report, names = {}, {}
    for source in sources:
        name = f"MH-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, none, unread = [], 0, 0, 0
        last_sr = 0
        gaps = 0
        for page in doc:
            groups = {}
            for x0, y0, _x1, _y1, text, *_ in page.get_text("words"):
                groups.setdefault(round(x0 / 3), []).append((y0, text))
            for key in sorted(groups):
                words = groups[key]
                sr = next((t for y, t in words if 735 <= y <= 750 and re.fullmatch(r"\d+", t)), None)
                rank = next((t for y, t in words if 695 <= y <= 712 and re.fullmatch(r"[\d.]+", t)), None)
                if not sr or not rank:
                    continue
                seen += 1
                if int(sr) != last_sr + 1:
                    gaps += 1
                last_sr = int(sr)
                # Everything lower on the page than the name and gender columns.
                tail = sorted(((y, t) for y, t in words if y < 380), key=lambda item: -item[0])
                joined = " ".join(t for _y, t in tail)
                if "Choice" in joined:
                    none += 1
                    continue
                position = next((i for i, (_y, t) in enumerate(tail) if CODE.match(t)), None)
                if position is None:
                    unread += 1
                    continue
                match = CODE.match(tail[position][1])
                code = match.group(1)
                college_words = [match.group(2)] + [t for _y, t in tail[position + 1:]]
                category = " ".join(t for _y, t in tail[:position])
                names.setdefault(code, " ".join(college_words))
                out.append({"rank": rank, "college": code, "course": "MBBS" if code.startswith("1") else "BDS",
                            "category": category, "seat": "", "quota": "", "gender": "", "remark": ""})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        report[name] = {"pages": len(doc), "seen": seen, "written": len(out), "noSeat": none, "rejected": unread, "serialGaps": gaps,
                        "courses": dict(Counter(r["course"] for r in out)), "categories": dict(Counter(r["category"] for r in out).most_common(70))}
        print(name, json.dumps({k: report[name][k] for k in ("pages", "seen", "written", "noSeat", "rejected", "serialGaps", "courses")}))
    with open(os.path.join(out_dir, "mh-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"files": report, "collegeNames": dict(sorted(names.items()))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
