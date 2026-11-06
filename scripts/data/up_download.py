"""Collect Uttar Pradesh's MBBS/BDS allotments, one institute at a time.

Usage: python -I scripts/data/up_download.py data/extracted/states/UP-2026.csv

DGME Uttar Pradesh publishes no single list. Its public page "Institute Wise Admitted / Allotted
Candidates List" (upneet.gov.in/vaccant_result/onallotmainCStatus.aspx) shows one institute per
form submission. This script submits that form once per institute, with a pause between requests,
and keeps only the institute, course, round, seat category, rank and whether the student moved
from another seat. Roll numbers, names and parents' names are never stored, and no raw page is saved.

The page shows the current holders of seats, so a student who later left a seat no longer appears
under it. Run it again after each round to refresh the list.
"""
import csv
import html
import http.cookiejar
import re
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser

BASE = "https://upneet.gov.in/vaccant_result/"
PAUSE_SECONDS = 6
FIELDS = ["institute", "instituteName", "course", "serial", "round", "category", "rank", "date", "movedFrom"]
ROUND = re.compile(r"^(Round\s*\d+|Mop.?up.*|Stray.*|Special.*)$", re.I)


class Page(HTMLParser):
    """Collect hidden form fields, institute options and table rows."""

    def __init__(self):
        super().__init__()
        self.hidden, self.options, self.rows = {}, [], []
        self._row, self._cell, self._option = None, None, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "input" and a.get("type") == "hidden" and a.get("name"):
            self.hidden[a["name"]] = a.get("value", "")
        elif tag == "option":
            self._option = [a.get("value", ""), ""]
        elif tag == "tr":
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            # The site leaves some cells unclosed, so a new cell closes the open one, as a browser does.
            self._close_cell()
            self._cell = []

    def _close_cell(self):
        if self._cell is not None and self._row is not None:
            self._row.append(re.sub(r"\s+", " ", "".join(self._cell)).strip())
        self._cell = None

    def handle_endtag(self, tag):
        if tag == "option" and self._option:
            self.options.append(self._option)
            self._option = None
        elif tag in ("td", "th"):
            self._close_cell()
        elif tag == "tr" and self._row is not None:
            self._close_cell()
            self.rows.append(self._row)
            self._row = None

    def handle_data(self, data):
        if self._option is not None:
            self._option[1] += data
        if self._cell is not None:
            self._cell.append(data)


def main():
    out_file = sys.argv[1]
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    opener.addheaders = [("User-Agent", "gined-medical data script (public allotment lists)")]

    def fetch(url, data=None):
        body = urllib.parse.urlencode(data).encode() if data is not None else None
        # The site sometimes stops answering for a while. Wait a minute and try again, three times at most.
        for attempt in range(4):
            try:
                with opener.open(url, body, timeout=60) as response:
                    text = response.read().decode("utf-8", "replace")
                break
            except OSError as error:
                if attempt == 3:
                    raise
                print(f"  no answer ({error}), waiting a minute", flush=True)
                time.sleep(60)
        if re.search(r"SESSION EXPIRED|Already Open", text, re.I):
            raise RuntimeError(f"The site ended the session at {url}.")
        page = Page()
        page.feed(text)
        return page

    # The form only opens after choosing "UP NEET UG Counseling" on the list page.
    start = fetch(BASE + "vseat_stream.aspx")
    fetch(BASE + "vseat_stream.aspx", {**start.hidden, "__EVENTTARGET": "ctl00$ContentPlaceHolder1$3", "__EVENTARGUMENT": ""})
    form = fetch(BASE + "onallotmainCStatus.aspx")
    institutes = [(v, html.unescape(t).strip()) for v, t in form.options if re.fullmatch(r"\d+", v)]
    print(f"{len(institutes)} institutes", flush=True)

    rows, empty = [], []
    for number, (code, name) in enumerate(institutes, start=1):
        time.sleep(PAUSE_SECONDS)
        page = fetch(BASE + "onallotmainCStatus.aspx", {**form.hidden, "ctl00$ContentPlaceHolder1$DDL_Institute": code,
                                                         "ctl00$ContentPlaceHolder1$Submit": "Submit"})
        course, found = "", 0
        for cells in page.rows:
            at = next((i for i, c in enumerate(cells) if ROUND.match(c)), -1)
            if at < 1:
                continue
            if at >= 2:
                course = cells[at - 2]
            # Cells at+2 to at+4 hold the roll number, name and father's name. They are never read.
            moved = cells[at + 7] if len(cells) > at + 7 else ""
            rows.append({"institute": code, "instituteName": re.sub(r"\s*\(\s*\d+\s*\)\s*$", "", name), "course": course,
                         "serial": cells[at - 1], "round": cells[at], "category": cells[at + 1], "rank": cells[at + 5],
                         "date": cells[at + 6], "movedFrom": "" if moved in ("", "-") else "yes"})
            found += 1
        if found == 0:
            empty.append(code)
        print(f"{number}/{len(institutes)} {code} rows {found}", flush=True)

    with open(out_file, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"saved {len(rows)} rows, institutes with none: {empty}", flush=True)


if __name__ == "__main__":
    main()
