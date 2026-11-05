"""Turn Gujarat's rank-wise allotment PDFs into plain CSV files.

Usage: python -I scripts/data/gj_extract.py data/raw/states/gj.json data/raw/states/pdfs data/extracted/states

Gujarat's lists have no ruled table, so columns are found by their position on the page.
The student's name sits to the left of these columns and is never read into a row.

Gujarat also publishes "Last Merit" files. They use its own state merit numbers, not All India
ranks, so they can't be cutoffs on the site, but they do let us check our reading of the lists.
"""
import csv
import json
import os
import re
import sys

import fitz

LABEL = re.compile(r"^([A-Z]+)-([A-Z]Q)$")
FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark", "merit", "admRound"]


def extract(path):
    doc = fitz.open(path)
    rows, unread = [], 0
    for page in doc:
        lines = {}
        for x0, y0, _x1, _y1, text, *_ in page.get_text("words"):
            lines.setdefault(round(y0), []).append((x0, text))
        for line in lines.values():
            line.sort()
            label = next((t for x, t in line if 360 <= x <= 400 and LABEL.match(t)), None)
            if not label:
                continue
            category = next((t for x, t in line if 335 <= x < 372), "")
            rank = next((t for x, t in line if 440 <= x <= 500 and re.fullmatch(r"\d+", t)), "")
            merit = next((t for x, t in line if 240 <= x < 268 and re.fullmatch(r"[\d.]+", t)), "")
            adm = next((t for x, t in line if 550 <= x and re.fullmatch(r"\d{2}", t)), "")
            if not rank or not category or not adm:
                unread += 1
                continue
            college, quota = LABEL.match(label).groups()
            rows.append({"rank": rank, "college": college, "course": "", "category": category, "seat": "", "quota": quota,
                         "gender": "", "remark": "", "merit": merit, "admRound": adm})
    return rows, unread, len(doc)


def official_open_merit(path):
    """Reads the first number after each -GQ label, which is the OPEN column."""
    doc = fitz.open(path)
    out = {}
    for page in doc:
        tokens = [t.strip() for t in page.get_text("text").split("\n") if t.strip()]
        for i, token in enumerate(tokens):
            match = LABEL.match(token)
            if match and match.group(2) == "GQ":
                for following in tokens[i + 1:i + 3]:
                    if re.fullmatch(r"[\d.]+", following):
                        out[match.group(1)] = following
                        break
    return out


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report = {}
    for source in sources:
        name = f"GJ-{source['name']}"
        path = os.path.join(pdf_dir, name + ".pdf")
        if source.get("lastMerit"):
            report[name] = {"openMerit": official_open_merit(path)}
            continue
        rows, unread, pages = extract(path)
        with open(os.path.join(out_dir, name + ".csv"), "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(rows)
        report[name] = {"pages": pages, "written": len(rows), "rejected": unread}
        print(name, "pages", pages, "written", len(rows), "unread", unread)
    with open(os.path.join(out_dir, "gj-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)


if __name__ == "__main__":
    main()
