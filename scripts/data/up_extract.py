"""Split Uttar Pradesh's downloaded allotments into one CSV per round, in the shared layout.

Usage: python -I scripts/data/up_extract.py data/raw/states/up.json data/extracted/states/UP-2026-all.csv data/extracted/states

The input comes from up_download.py. The institute's number goes in front of its name, because
minority seats are listed as separate institutes with the same name.
"""
import csv
import json
import os
import sys
from collections import Counter

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]


def main():
    sources_file, all_file, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    with open(all_file, encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    report = {}
    for source in sources:
        name = f"UP-{source['name']}"
        wanted = f"Round{source['round']}"
        out = [{"rank": r["rank"], "college": r["institute"] + " " + " ".join(r["instituteName"].split()),
                "course": "MBBS" if r["course"] == "MBBS" else "BDS", "category": r["category"], "seat": "",
                "quota": r["institute"], "gender": "", "remark": "moved from another seat" if r["movedFrom"] else ""}
               for r in rows if r["round"] == wanted]
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        report[name] = {"written": len(out), "mbbs": sum(r["course"] == "MBBS" for r in out),
                        "categories": dict(Counter(r["category"] for r in out if r["course"] == "MBBS").most_common(40))}
        print(name, json.dumps(report[name]))
    with open(os.path.join(out_dir, "up-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"files": report, "institutes": len({r["institute"] for r in rows}), "rows": len(rows)}, handle, indent=2)


if __name__ == "__main__":
    main()
