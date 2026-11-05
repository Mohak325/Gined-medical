"""Turn Kerala's KEAM allotment lists into plain CSV files.

Usage: python -I scripts/data/kl_extract.py data/raw/states/kl.json data/raw/states/pdfs data/extracted/states

These ranks are Kerala's own KEAM medical ranks, not All India ranks. Application numbers are used
while this runs, to spot a student who only kept the same seat, and are never written. Column order
changes between phases, so columns are found by their headings.
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
    return re.sub(r"[^a-z]", "", value.lower())


def rows_of(doc):
    header = None
    for page in doc:
        for table in page.find_tables().tables:
            for row in table.extract():
                cells = [clean(c) for c in row]
                keys = [key(c) for c in cells]
                if "applno" in keys:
                    header = keys
                    continue
                if header and len(cells) == len(header) and cells[0].isdigit():
                    yield dict(zip(header, cells))


def last_ranks(path):
    """Read the official last rank table for MBBS, as {college code|seat code: rank}."""
    found, section = {}, None
    for page in fitz.open(path):
        for table in page.find_tables().tables:
            head = None
            for row in table.extract():
                cells = [clean(c) for c in row]
                if cells[0] in ("MBBS", "BDS"):
                    section = cells[0]
                elif cells[0] == "Name of College":
                    head = cells
                elif section == "MBBS" and head and cells[0]:
                    for code, value in zip(head[3:16], cells[3:16]):
                        if value != "-":
                            found[f"{cells[0]}|{code}"] = int(value)
                    for part in cells[16].split(","):
                        if ":" in part:
                            code, value = part.strip().split(":")
                            found[f"{cells[0]}|{code}"] = int(value)
    return found


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report, colleges, held = {}, Counter(), {}
    for source in sources:
        name = f"KL-{source['name']}"
        doc = fitz.open(os.path.join(pdf_dir, name + ".pdf"))
        out, seen, kept, last, gaps = [], 0, 0, 0, 0
        remarks = Counter()
        for row in rows_of(doc):
            seen += 1
            serial = int(next(iter(row.values())))
            if serial != last + 1:
                gaps += 1
            last = serial
            college = row.get("collegename") or row.get("college", "")
            seat_type = row.get("allotted") or row.get("seat", "")
            remark = row.get("remarks", "")
            remarks[remark] += 1
            seat = (college, seat_type)
            if "retained" in remark.lower() or held.get(row["applno"]) == seat:
                kept += 1
                held[row["applno"]] = seat
                continue
            held[row["applno"]] = seat
            if row.get("course") == "MBBS":
                colleges[college] += 1
            out.append({"rank": row.get("rank", ""), "college": college, "course": row.get("course", ""), "category": seat_type,
                        "seat": "", "quota": "", "gender": "", "remark": remark})
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(out)
        mbbs = [r for r in out if r["course"] == "MBBS"]
        report[name] = {"pages": len(doc), "seen": seen, "written": len(out), "kept": kept, "serialGaps": gaps, "mbbs": len(mbbs),
                        "remarks": dict(remarks), "categories": dict(Counter(r["category"] for r in mbbs).most_common(40))}
        print(name, json.dumps(report[name]), flush=True)
    with open(os.path.join(out_dir, "kl-report.json"), "w", encoding="utf-8") as handle:
        json.dump({"files": report, "collegeNames": dict(sorted(colleges.items())),
                   "lastRankPhase1": last_ranks(os.path.join(pdf_dir, "KL-lastrank-p1.pdf"))}, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
