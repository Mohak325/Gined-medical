"""Turn West Bengal's allotment results into plain CSV files.

Usage: python -I scripts/data/wb_extract.py data/raw/states/wb.json data/raw/states/pdfs data/extracted/states

The PDFs draw text with Type 3 fonts whose character codes are numbered in order of first use, so
ordinary text extraction gives gibberish. But each character is drawn by the same instructions
wherever it appears. GLYPHS maps a hash of those instructions to the character, read by eye once
from a sheet of all 91 shapes. Any shape not in GLYPHS stops the script, so a new one gets looked at.

The pages are printed sideways: each student runs down the page as one row, and the height on the
page tells the column. The lists hold no names.
"""
import csv
import hashlib
import json
import os
import re
import sys
from collections import Counter

import fitz

FIELDS = ["rank", "college", "course", "category", "seat", "quota", "gender", "remark"]
GLYPHS = {
    "01e24194508d": "U", "028b99b01570": "T", "03a06196c9ee": "N", "0516e56b8a2f": "v", "06014be81a3c": "D", "0799f60696bd": "2",
    "07af328bcb96": "(", "0aa29cef34de": "A", "0e169e79c7db": "M", "109a1bf7a18e": "P", "1278b3ec905a": "9", "12c94fda7857": "=",
    "163c4897970f": "5", "186f9e0330a2": "8", "18dc300e00fe": "e", "1d8ff01f7982": "Q", "20045d5a6e95": "1", "217800f72e86": "J",
    "2317a61d02a9": "V", "2659c93c6674": "F", "2b5abc92943b": "U", "316a1fc575b7": "W", "342307fb89ac": "-", "361cc7e4ba04": "h",
    "3650c1dad5d5": "S", "39ccb9c432b1": "Q", "3a2cd39458af": "&", "3c0ce5819dd4": "B", "3e86f4ce5f49": "R", "3ea7fcd4eef0": "V",
    "3f289fe2eee2": "n", "41305a75a543": "t", "4a8bbff4d352": ")", "4d20788c9002": "y", "54d0eb6b1259": "E", "59b6ed0fe945": "2",
    "5d2669a56320": "C", "633b0be4e0cd": "C", "661487fe7909": "K", "6ad15cd26b77": "3", "6fb2b6cb43bc": "O", "70c5812a8e60": "0",
    "719659db14b8": "L", "755b9540e2c3": "a", "793ef94259f4": "o", "7fba5136af36": "M", "80a4f119556f": "b", "8392ea06c456": "H",
    "844d2a56806a": "H", "856e27990973": "B", "87f16e5c3605": "w", "88370d7d24b2": "G", "88a5ca78aa06": "W", "8fd82979ce47": ")",
    "9200657f3930": "S", "94828e7f2a70": "L", "95d37bcbd3cf": "Y", "9676b80bd8b4": "P", "971b18f75c98": "K", "9795b9b0c462": "O",
    "9ad45d2cd568": "d", "a0b7287f48ec": ".", "a1a0916d48bc": "u", "a25ce0a3b94e": "k", "a28f6c983af1": "G", "a2cd648418ed": ",",
    "a43c75537455": "(", "a5106adca1aa": "T", "a82a7c46b846": "R", "a8d4f5f76e2a": "g", "ac2a6d991e06": "c", "b222b631fe8d": ".",
    "b9735a9b54e4": "m", "bfe3c5a27682": "N", "c0cfdcc16b28": "&", "c2e33e6ac4e5": "E", "c6bc3f98927a": " ", "c76bace5a561": "D",
    "d0f1f70d431b": "l", "d3561da54363": "I", "d3c0d803e671": "r", "d562549902d2": "i", "d611ed3f1501": "I", "d679cb1ff0c7": "A",
    "d6b6e452073a": "7", "d89e8114b522": "6", "e754851deb9a": "0", "e7c849f3fbb0": "s", "e85e04218a87": "4", "e9a46a32df3e": "6",
    "ea4bb3cd18c0": "Y",
}
HEADINGS = {"ROUND": "round", "ALL INDIA": "rank", "CHOICE": "choice", "INSTITUTE": "college", "COURSE": "course",
            "ALLOTTED QUOTA": "quota", "ALLOTTED": "category", "CANDIDATE": "candidate", "STATUS": "status"}


def font_maps(doc):
    """For each Type 3 font: character code -> character."""
    maps = {}
    for page in doc:
        for f in page.get_fonts():
            if f[2] != "Type3" or f[0] in maps:
                continue
            obj = doc.xref_object(f[0])
            body = re.search(r"/CharProcs\s*(\d+ 0 R|<<.*?>>)", obj, re.S).group(1)
            if body.endswith("R"):
                body = doc.xref_object(int(body.split()[0]))
            procs = {n: int(r) for n, r in re.findall(r"/([^\s/<>]+)\s+(\d+) 0 R", body)}
            enc = re.search(r"/Encoding\s*(\d+) 0 R", obj)
            enc_obj = doc.xref_object(int(enc.group(1))) if enc else obj
            code, mapping = 0, {}
            for tok in re.findall(r"\d+|/[^\s/\[\]]+", re.search(r"/Differences\s*\[(.*?)\]", enc_obj, re.S).group(1)):
                if tok.startswith("/"):
                    if tok[1:] in procs:
                        shape = hashlib.sha1(doc.xref_stream(procs[tok[1:]])).hexdigest()[:12]
                        if shape not in GLYPHS:
                            raise ValueError(f"Unknown glyph shape {shape} in font {f[0]}. Add it to GLYPHS.")
                        mapping[code] = GLYPHS[shape]
                    code += 1
                else:
                    code = int(tok)
            maps[f[0]] = mapping
    return maps


def page_lines(page, maps):
    lines = []
    for block in page.get_text("rawdict")["blocks"]:
        for line in block.get("lines", []):
            text = ""
            for span in line["spans"]:
                xref = int(re.search(r"\((\d+) 0 R\)", span["font"]).group(1))
                text += "".join(maps[xref].get(ord(c["c"]), "?") for c in span["chars"])
            lines.append((line["bbox"][0], line["bbox"][1], text.strip()))
    return lines


def main():
    sources_file, pdf_dir, out_dir = sys.argv[1:4]
    with open(sources_file, encoding="utf-8") as handle:
        sources = json.load(handle)
    report = {}
    for pdf_name in sorted({s["pdf"] for s in sources}):
        doc = fitz.open(os.path.join(pdf_dir, pdf_name + ".pdf"))
        maps = font_maps(doc)
        out, unread = [], 0
        if not maps:
            # Some files use ordinary fonts and ruled tables, with the same headings.
            keys = {"ROUND": "gender", "ALL INDIA RANK": "rank", "INSTITUTE": "college", "COURSE": "course",
                    "ALLOTTED QUOTA": "quota", "ALLOTTED CATEGORY": "category", "CANDIDATE CATEGORY": "seat", "STATUS": "remark"}
            for page in doc:
                for table in page.find_tables().tables:
                    head = None
                    for cells in table.extract():
                        cells = [re.sub(r"\s+", " ", c or "").strip() for c in cells]
                        if "ALL INDIA RANK" in cells:
                            head = cells
                        elif head and cells and cells[0]:
                            row = dict(zip(head, cells))
                            out.append({field: row.get(label, "") for label, field in keys.items()} | {"seat": row.get("CANDIDATE CATEGORY", "")})
            for row in out:
                row.setdefault("gender", "")
            out = [{k: r.get(k, "") for k in FIELDS} for r in out]
        for page in (doc if maps else []):
            lines = page_lines(page, maps)
            # Column positions come from the heading row on each page.
            heads = {HEADINGS[text]: y for x, y, text in lines if text in HEADINGS}
            if "course" not in heads:
                continue
            # Each value belongs to the heading nearest its position.
            def column(y):
                return min(heads.items(), key=lambda item: abs(item[1] - y))[0]
            head_x = min(x for x, y, t in lines if t == "COURSE")
            # Each row's course cell is one line. Wrapped cells start a little to its right.
            anchors = sorted(x for x, y, t in lines if x > head_x + 15 and column(y) == "course")
            rows = {a: {} for a in anchors}
            for x, y, text in lines:
                if x <= head_x + 15:
                    continue
                anchor = max((a for a in anchors if a <= x + 1), default=None)
                if anchor is None:
                    unread += 1
                    continue
                field = column(y)
                if field == "status" and text.isdigit():
                    continue  # the page number in the footer
                rows[anchor][field] =(rows[anchor].get(field, "") + " " + text).strip()
            for row in rows.values():
                out.append({"rank": row.get("rank", ""), "college": row.get("college", ""), "course": row.get("course", ""),
                            "category": row.get("category", ""), "seat": row.get("candidate", ""), "quota": row.get("quota", ""),
                            "gender": row.get("round", ""), "remark": row.get("status", "")})
        # The list shows who holds each seat now, with the round in which they won it.
        for source in (s for s in sources if s["pdf"] == pdf_name):
            with open(os.path.join(out_dir, f"WB-{source['name']}.csv"), "w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=FIELDS)
                writer.writeheader()
                writer.writerows(r for r in out if source["roundLabel"] is None or r["gender"] == source["roundLabel"])
        mbbs = [r for r in out if r["course"] == "MBBS"]
        report[pdf_name] = {"pages": len(doc), "rows": len(out), "unread": unread, "mbbs": len(mbbs),
                        "badRank": sum(not re.fullmatch(r"\d+", r["rank"]) for r in out),
                        "rounds": dict(Counter(r["gender"] for r in mbbs)), "statuses": dict(Counter(r["remark"] for r in mbbs)),
                        "quotas": dict(Counter(r["quota"] for r in mbbs)), "categories": dict(Counter(r["category"] for r in mbbs).most_common(40)),
                        "colleges": dict(Counter(r["college"] for r in mbbs))}
        print(pdf_name, json.dumps({k: v for k, v in report[pdf_name].items() if k != "colleges"}), flush=True)
    with open(os.path.join(out_dir, "wb-report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
