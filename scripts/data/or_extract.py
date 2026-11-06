"""Turn Odisha's MBBS/BDS allotment lists into plain CSV files.

Usage: python -I scripts/data/or_extract.py data/raw/states/or.json data/raw/states/pdfs data/extracted/states

Each list has a different layout, so each source names its own columns. Rounds 2 and 3 show each
student's earlier seat beside the new one, and a status: only "upgraded" and "fresh" rows are new
seats. Ranks are NEET All India ranks. Application numbers and names are never written.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]
NEW = re.compile(r"^(UPGRADE|FRESH|Seat Upgraded|Fresh)", re.I)


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report = {}
    for source in sources:
        name = f"OR-{source['name']}"
        cols = source["columns"]
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, kept = [], 0, 0
        statuses = Counter()
        for page in doc:
            for table in page.find_tables().tables:
                for row in table.extract():
                    cells = [clean(c) for c in row]
                    if len(cells) <= max(v for v in cols.values() if v is not None) or not cells[cols["rank"]].isdigit():
                        continue
                    seen += 1
                    status = cells[cols["status"]] if cols.get("status") is not None else ""
                    statuses[status] += 1
                    if cols.get("status") is not None and not NEW.match(status):
                        kept += 1
                        continue
                    out.append({"rank": cells[cols["rank"]], "college": cells[cols["college"]], "course": cells[cols["course"]],
                                "category": cells[cols["category"]], "seat": "",
                                "quota": cells[cols["quota"]] if cols.get("quota") is not None else "", "gender": "", "remark": status})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        mbbs = [r for r in out if r["course"] == "MBBS"]
        report[name] = {"pages": len(doc), "seen": seen, "written": len(out), "kept": kept, "mbbs": len(mbbs), "statuses": dict(statuses),
                        "quotas": dict(Counter(r["quota"] for r in mbbs)), "categories": dict(Counter(r["category"] for r in mbbs).most_common(40)),
                        "colleges": dict(Counter(r["college"] for r in mbbs))}
        print(name, json.dumps({k: v for k, v in report[name].items() if k != "colleges"}), flush=True)
    with open(os.path.join(out_dir, "or-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
