# Data sources

Where every dataset comes from, which year it covers, and how we know.
Update this file whenever a source changes.

## Current sources

| Dataset | File in `data/raw/nexdoc/` | Year | Original publisher | How we got it |
|---|---|---|---|---|
| College list | `colleges_details.json` | Snapshot from July 2026 | NMC | Second-hand, from NexDoc |
| UG seats | `ug_all.json` | 2026-27 | NMC, MCC, states | Second-hand, from NexDoc |
| PG seats | `pg_all.json` | Not stated | NMC, MCC, states | Second-hand, from NexDoc |
| Second opinion on 2025 cutoffs (not shown on the site) | `ug_colleges_aiq_mapping.json` | 2025, Rounds 1 to 3 | MCC | Second-hand, from NexDoc |

**UG All India cutoffs now come straight from MCC.** The nine result PDFs are listed in
`data/raw/mcc/sources.json` with each file's address, size and fingerprint: 2025 Rounds 1 to 3,
stray and special stray, and 2026 Rounds 1 to 3 and stray. Retrieved 5 November 2026 from
<https://mcc.nic.in/archive-ug/> and <https://mcc.nic.in/current-events-ug/>. The PDFs aren't
kept in git because they're large: `npm run data:download` fetches them again. The rows
taken from them are in `data/extracted/mcc/`.

**PG All India cutoffs also come straight from MCC.** The five NEET PG result PDFs are listed in
`data/raw/mcc-pg/sources.json`: 2025 Rounds 1 to 3 and stray, and 2026 Round 1. Retrieved 6 November 2026 from
<https://mcc.nic.in/archive-pg/> and <https://mcc.nic.in/current-events-pg/>. They hold ranks only, with no names.
All five are read, into `data/extracted/mcc-pg/`. Rounds 2 and 3 repeat each student's earlier seats on the
same row, so only that round's own columns are kept. DNB quota rows (32,078) are left out, because DNB seats
are in hospitals the site doesn't list.

| Check | Result |
|---|---|
| Rows read | 2026 Round 1: 28,723, last rank 1,59,922, both matching [hireguideeducation.org](https://hireguideeducation.org/alerts/mcc-neet-pg-2026-round-1-final-result-cutoff-reporting-analysis). 2025 Round 1: 26,889. 2025 stray: 2,798. No serial number skipped and no rank out of order |
| 2025 Rounds 2 and 3 | Round 2: 20,787 allotted, 9,667 of them All India, matching [hellomentor.in](https://hellomentor.in/news-blogs/mcc-neet-pg-counselling-2025-round-2-seat-allotment-result-analysis); last rank 1,38,628. Round 3: 10,084 fresh allotments and 8,589 upgrades, matching [Careers360](https://news.careers360.com/mcc-neet-pg-2025-round-3-final-results-out-10084-fresh-allotments-8589-upgrades-two-seats-withdrawn-reporting-dates); last rank 2,30,087. No row rejected and no rank out of order |
| 2026 Round 1 All India closing rank by category | All five match [Careers360](https://medicine.careers360.com/articles/mcc-neet-pg-counselling-2026-round-1-cutoff-out): General 1,27,533, EWS 1,32,185, OBC 1,49,301, SC 1,59,338, ST 1,59,693 |
| 2026 Round 1 Open closing rank by branch | MD General Medicine 4,703 and MD Radio Diagnosis 3,058, both matching hireguideeducation.org |
| College names | 744 names: 24 reuse a UG decision, 539 matched by name or PIN, 177 by `mcc-college-overrides.json`, 141 of them PG decisions marked `"track": "pg"`, 4 not on the site |
| Courses | MCC writes one specialty several ways, so `pgSpecialty` in `scripts/data/mcc-lib.mjs` maps each to the name the college lists in its seats. 308 of 39,181 cutoff rows are on a course missing from the college's seat list |

**Karnataka's state-quota cutoffs come straight from KEA.** The eight result PDFs are listed in
`data/raw/kea/sources.json`: 2025 and 2026, Rounds 1 to 3 and the first stray round. Retrieved 5 November
2026 from <https://cetonline.karnataka.gov.in/kea/ugneet2026> and the 2025 page beside it. KEA's lists hold
no student names. The rows taken from them are in `data/extracted/kea/`. They also hold each seat's fee,
which the build turns into official fees (see below).

**Bihar, Chhattisgarh, Rajasthan, Gujarat, Andhra Pradesh, Telangana, Haryana, Maharashtra, Punjab, Himachal Pradesh, Madhya Pradesh, Tamil Nadu, Kerala, Uttar Pradesh, West Bengal, Odisha, Puducherry and Uttarakhand come straight from their counselling authorities.** The files
are listed in `data/raw/states/sources.json`, `gj.json`, `ap.json`, `tg.json`, `mh.json`, `pb.json`, `hp.json`, `mp.json`, `tn.json`, `kl.json`, `up.json`, `wb.json`, `or.json`, `py.json` and `uk.json`. These lists include student names, so the extractors keep only rank, college, course, category,
seat, quota, gender, remark and, where needed, merit number and round. The PDFs are never committed, so `npm run data:download` fetches
Karnataka's and MCC's, and those three files give the addresses for the rest.

| State | Covers | How it was checked |
|---|---|---|
| Bihar | 2025 and 2026, Rounds 1 to 3 and stray | All 142 of BCECEB's own published 2026 Round 1 closing ranks appear in our data, matched on category and rank |
| Chhattisgarh | 2026, Rounds 1 to 3 and stray. Rounds 3 and stray are marked provisional | No outside figure yet. Each college's Round 1 count fits within its seats |
| Rajasthan | 2026, Round 1 and stray, both marked provisional. Rounds 2 and 3 use another layout and aren't read yet | Round 1 count matches [Careers360](https://news.careers360.com/rajasthan-neet-ug-seat-allotment-result-2026-round-1-out-ug-neetrajasthan-com-mbbs-bds-counselling-admission/amp) (5,666) |
| Gujarat | 2026, Rounds 1 to 3 and stray | 52 of 53 of its own published Round 1 last merit numbers match, for Open seats. Rajpipla differs by one. Round 1 count matches [neet2seat](https://neet2seat.com/news/gujarat-neet-ug-2026-round-1-allotment) (7,459) |
| Telangana | 2026, Phases 1 and 2, mop-up and stray, for competent authority and management quota | Counts match [neet2seat](https://neet2seat.com/news/telangana-neet-ug-2026-phase-1-mbbs-allotment) for Phase 1 (4,734) and [Phase 2](https://neet2seat.com/news/telangana-neet-ug-2026-phase-2-allotment-management-quota-phase-1) (6,181). All 12 of its statewide last ranks for Phase 1 match |
| Haryana | 2026, Round 1 and stray, both marked provisional. Rounds 2 and 3 mark rows "Joined" or "Not Allotted", so new seats can't be told apart, and they aren't used | No outside figure yet. Each college's Round 1 count fits within its seats |
| Odisha | 2026, Rounds 1 to 3, stray upgradation and physical stray, from OJEE | Round 1's 1,694 home state, 290 government school and 18 NRI allotments match [neet2seat](https://neet2seat.com/news/odisha-neet-ug-2026-round-1-provisional-allotment), and so do its 648 open government MBBS seats running to rank 95,204 |
| Puducherry | 2026, Rounds 1 to 3, from CENTAC's lists on Google Drive. Its stray lists had no MBBS rows | No outside figure. A report that IGMCRI's general government seats closed at 509 marks fits our closing rank of 74,606 |
| Uttarakhand | 2026, Rounds 1 to 3 and stray, from HNBUMU's broadsheets. The Round 1 file is named "UG2025..." but its contents are 2026 | Round 1's 1,245 seats and 1,057 MBBS seats match neet2seat |
| West Bengal | 2026, Round 1 from its own list (marked provisional). Rounds 2 and 3 and stray from the stray round result, which shows current seat holders only | The 6,422 seats and 5,833 MBBS seats in Round 1 match [neet2seat](https://neet2seat.com/news/wb-neet-ug-2026-round-1-seat-allotment-result), and so do all five of its government college median closing ranks |
| Uttar Pradesh | 2026, Rounds 1 to 3, collected on 6 November 2026 from DGME's institute-wise page, one request per institute | 60 of 80 of [Sartha's](https://www.sartha.in/blogs/up-neet-ug-2026-round-1-cutoff-mbbs-college-wise-government-private) Round 1 government closing ranks match, and none of ours is higher. 4 of 5 private ones match |
| Tamil Nadu | 2026, Rounds 1 to 3 and stray, government and management quota, all marked provisional. **Ranks are Tamil Nadu's own, not All India.** The 7.5% government school lists aren't included | 18 of [neet2seat's](https://neet2seat.com/guides/tamil-nadu/tamil-nadu-mbbs-cutoffs-2026) reserved category closing ranks, at Madras, Stanley and Kilpauk, match. Its Open figures differ slightly, as explained below |
| Kerala | 2026, Phases 1 to 3 and stray. **Ranks are KEAM medical ranks, not All India** | All 378 of the state's own Phase 1 last ranks for the 13 seat codes we offer match |
| Madhya Pradesh | 2026, Rounds 1 and 2 and mop-up (mop-up marked provisional). No stray result was linked | All 886 of its own closing rank and seat count figures, across the three rounds, match what we calculate from its student lists. The Round 1 closing rank table comes from a Medical Dialogues copy, and its student list copy was byte-identical to the official file |
| Punjab | 2026, Rounds 1 to 3 and stray. Round 1 and stray are marked provisional | 15 closing All India ranks across Rounds 1 to 3 match [neet2seat](https://neet2seat.com/guides/punjab/punjab-mbbs-cutoffs-2026). The 2,410 students listed in Round 1 match [Careers360](https://news.careers360.com/punjab-neet-counselling-2026-round-1-seat-allotment-out-mbbs-bds-dayanand-medical-college-gmc-patiala-top-choice-bfuhs-ggsmch-org). One Round 1 NRI seat, with no rank in any list we read, is left out |
| Himachal Pradesh | 2026, Rounds 1 to 3 and stray, final lists. A second stray round was scheduled but isn't included | No outside figure yet. Each college's Round 1 count fits within its seats |
| Maharashtra | 2026, Round 1 only, marked provisional. Later rounds aren't linked publicly that we could find, and the portal page asks for a login | The 31,047 candidates and 10,509 allotted match [neet2seat](https://neet2seat.com/news/maharashtra-neet-ug-2026-round-1-selection-list). So do its last Open ranks: 47,413 government and 1,14,441 private |
| Andhra Pradesh | 2026, Phases 1 to 3 and competent-quota stray. Management-quota stray rounds aren't read yet | Management Phase 1 count matches [neet2seat](https://neet2seat.com/news/andhra-pradesh-neet-ug-2026-phase-2-web-options-management-quota-allotment) (1,629). Each college's Round 1 count fits its seats, apart from Paderu (71 against 50) |

**Check what a state's "rank" means before using it.** Gujarat's last-merit files use its own state merit numbers, and Tamil Nadu's and Kerala's lists use a state
rank. The site compares against All India ranks, so those numbers can't be used directly. Gujarat's lists also have an All India rank column, which is what we use.

Odisha's `SGS` seats are its government school pool, and its `GC`, `PH` and `EX` sub-categories are green card, disability and ex-servicemen seats. All stay `special`. Puducherry's codes start with a region letter: only the U.T. codes (`U..`) are offered, and Karaikal, Mahe and Yanam codes, sub-quotas after a `/` and Telugu minority seats stay `special`. Uttarakhand's broadsheets list names and roll numbers, which are never read. Its "All India open" seats in private colleges are offered as their own option, and its women's seats are offered too. Jharkhand isn't added: its allotments sit on a separate portal and use Jharkhand's own merit rank.

West Bengal's stray round PDF draws text with Type 3 fonts that number each character in order of first use, so normal text extraction gives gibberish. No OCR is needed: each character is drawn by the same instructions wherever it appears, so `wb_extract.py` maps a hash of those instructions to the character. The 91 shapes were read by eye once, and an unknown shape stops the script. Its pages are sideways, so a student is a column of text on the page. Its Round 1 list uses ordinary fonts. Neither has names. Its Round 1 list is no longer linked from WBMCC's page, and neet2seat's article gave the address. West Bengal now has one OBC pool, where it used to have OBC-A and OBC-B. East West Institute, Burdwan isn't in its lists.

Uttar Pradesh publishes no list file. Its page shows one institute at a time, so `npm run data:up:download` asks for each in turn, 6 seconds apart, and keeps only the institute,
course, round, seat category, rank and whether the student moved from another seat. The page shows who holds each seat now. A student who got a seat and later moved on
isn't listed, so our closing ranks can be lower than the ones announced, as the comparison with Sartha shows. Institutes 42 to 47 are minority quota seats and stay `special`.
GL is read as the girls' seat. FF, PH, EX and NC are freedom fighter, disability, ex-serviceman and NCC seats, which is our reading, and stay `special`. Six institutes aren't on the
site, including Mayo Institute, Barabanki.

Tamil Nadu and Kerala counsel on their own ranks, so the predictor asks for that rank when either state is chosen, and those rows carry `rankType: "state"`. Their `category` is always `state_only`, so they can't mix with All India figures.

Tamil Nadu's government lists show each student's community and not the seat they took. Our closing rank for BC, for example, is the last BC student to get a seat, whichever seat that was. The OC figure is the last OC student, and neet2seat's Open figure is a little different (Madras Round 3: its 152 against our Round 2 143). Its management quota has a separate rank list, which the form says. A1 (ESIC), IRT ward, CMC 20%, minority, sports, disability and ex-serviceman seats are kept as `special`.

Kerala's own last rank table counts `SM-EZ` and `FL-EZ` as Ezhava, and likewise for other communities, so we do too. The prospectus confirms the 13 codes we offer. `AM`, `AC`, `MM`, `NC` and `NM` aren't explained in what we've read, so they stay `special`, as do `PD`, `XS` and other sub-quotas. Kerala's Phase 2 last rank table is cumulative, so only Phase 1 is compared.

Punjab's Round 1 list has roll numbers and no rank, so the rank comes from its merit lists. Himachal Pradesh does the same with application numbers. Those numbers are only used
while the extractors run and are never saved. Punjab's "Open Quota" seats are kept as `special`, because we haven't confirmed who they're for: its notification is a scanned file. In Madhya Pradesh, we read
`X` in a seat code as the ordinary seat, because `GS`, `PH`, `SN` and `FF` look like sub-quotas. Those four stay `special`. This reading isn't confirmed by its rule book yet.

In Maharashtra, the list's legend gives W as women's quota, EMD and EMR as earmarking donor and receiver, HA as hilly area, D1 to D3 as defence and I.Q. as
institute quota. EMD and EMR seats stay in their category, which is our reading. `MKB` isn't in the legend, so it's kept as `special`. Colleges with no rows,
including deemed universities, aren't in this list.

In Telangana, the seat tags use the same `MRC` label as Andhra Pradesh, and `MSM` appears on minority seats. Both are kept with their category, which is our reading.
Malla Reddy's two colleges and AIIMS Bibinagar aren't in KNRUHS's lists.

In Andhra Pradesh, `MRC` means Meritorious Reserved Category. Those students are kept with their category, and that grouping is our reading. `AU` and `SVU`
are its two regions, and `UR` is unreserved, which is also our reading of its seat codes. Confirm them with the university.

Only codes whose meaning is confirmed are offered in the predictor. In Bihar, `DQ` is the disability quota, while `RCG`, `MM`,
`SM` and `WQ` aren't confirmed, so they're kept as `special`. Two readings are inferred: Rajasthan's `G` suffix as the 25% of
seats its bulletin sets aside for women, and Chhattisgarh's `-NC` as the ordinary seat in a category. Confirm both with those authorities.

Students who only kept an earlier seat can't always be told apart in these three states' later rounds, so Rounds 2 and up are
less certain than Round 1. The predictor uses Round 1.

KEA ran more stray rounds after the first (four more in 2026, two more in 2025). They're small mop-ups and
aren't included. Dental and AYUSH lists aren't included either.

The site stores rounds as numbers: 1 to 3 as named, 4 for the stray vacancy round and 5 for the
special stray round. The 2026 special stray round was still running on 5 November 2026, so add
it when MCC publishes the result.

**NexDoc:** <https://github.com/deekshithvodela/nexdoc>, copied at the commit in
`data/raw/nexdoc/COMMIT` (last updated 15 August 2026). Its licence files are saved
beside the data. They allow commercial use and require credit, a link to the licence
and a note that we changed the data, so the site footer credits it.

## How the years were worked out

The source files state no year, so each one had to be confirmed from outside.

**NexDoc's cutoffs are 2025.** Two figures match press reports of the 2025 MCC Round 1 result:

- AIIMS Delhi, general closing rank 48: [Careers360](https://news.careers360.com/mcc-neet-ug-counselling-2025-round-1-seat-allotment-result-pdf-out-mcc-nic-in-top-48-candidates-get-aiq-mbbs-seats-aiims-delhi)
- Madras Medical College, general closing rank 695: [CollegeDekho](https://www.collegedekho.com/news/madras-medical-college-neet-ug-round-1-allotment-cutoff-2025-analysis-top-700-rank-holders-under-open-category-secure-admission-69894)

The old conversion script had "2024" typed in by mistake.

**MCC's PDFs state their own year and round**, and three more press figures match: AIIMS Delhi
closed at [52 in 2026](https://medicine.careers360.com/articles/mcc-neet-2026-round-1-cutoff),
and Maulana Azad at [103 in 2025 and 129 in 2026](https://neet2seat.com/cutoffs/all-india/maulana-azad-medical-college).
The 2025 Round 1 PDF has [26,608 allotted students](https://news.careers360.com/neet-ug-2025-cutoff-out-mcc-26608-allotted-mbbs-bds-bsc-nursing-aiq-seats-557-nri-closing-rank-aiims-government-medical-colleges),
as reported. For 2026 we count 29,946 in the final list, while the press reported
[29,945](https://news.careers360.com/neet-ug-2026-round-1-seat-allotment-out-mcc-nic-in-29945-mbbs-bds-allied-admissions-medical-college-reporting/amp).
That report may describe an earlier version of the list; we haven't confirmed why they differ.

**KEA's figures match an independent report.** [neet2seat](https://neet2seat.com/news/karnataka-neet-ug-2026-round-1-final-allotment)
reports 11,875 MBBS students allotted in 2026 Round 1, the same as our count. Nine General Merit closing ranks
from its table also match exactly, including Bangalore Medical College (2,655) and JSS Mysore (12,456). The
closing-rank report compiles the same KEA list, so it checks our reading and college matching, not KEA itself.

## What Karnataka's codes mean

From KEA's UGNEET 2026 information bulletin (sections 11 to 13) and its seat matrix.

| Code | Meaning |
|---|---|
| Course code ending `MG`, `MP`, `MN`, `MQ` | Government, Private, NRI and Others seats |
| `GM`, `1`, `2A`, `2B`, `3A`, `3B`, `SC`, `ST` | Base category. These reservations apply only to eligible Karnataka candidates |
| Ending `G`, `R`, `K` | General, Rural and Kannada medium |
| Ending `H` | Hyderabad-Karnataka region, under Article 371(J) |
| `GMP`, `GMPH` | Private seats for Karnataka candidates |
| `OPN` | Private seats open to any Indian citizen |
| `OTH`, `NRI` | Others (management) and NRI seats |
| `MA`, `MC`, `ME`, `MK`, `MM`, `MU`, `RC1` to `RC8` | Minority seats and St John's categories, kept as `special` |
| `PH`, `PHM`, `D`, `DK`, `XD`, `NCC`, `SPO`, `S-G`, `JK`, `CAP`, `AGL` | Special categories such as disability, defence, NCC and sports, kept as `special` |

**S1 to S4 are not fully confirmed.** They appear only in 2026, in place of `SCG`. The bulletin says SC was split
into SCA, SCB and SCC, and the seat matrix has four SC columns: SCA, SCB, SCC and "SCC (20%)". That order probably
matches S1 to S4, but no KEA document we found states it, so the site shows KEA's codes rather than claiming this.
Confirm with KEA before relying on it.

## What the comparison with NexDoc found

We calculated 2025 closing ranks from MCC's PDFs and compared them with NexDoc's. Of 5,513
results, 5,094 matched exactly, so NexDoc's method for closing ranks is the same as ours. The
other 419 were:

- **254 results filed under the wrong college.** Each exists in MCC's PDF under another college.
  For example, Career Institute of Medical Sciences, a private college, had King George's Medical
  University's ranks. The old site showed these.
- **162 dental results placed on medical colleges**, such as BDS rows on Maulana Azad.
- **3 small differences.** A rank of 13767.5 was treated differently, and two Aligarh NRI rows
  use a different label here.

`npm run data:check` still confirms that NexDoc's medical results exist in our data, as a
guard against a broken extraction.

AIIMS Guwahati's duplicate rows came from this mismatch: the extra rows were Gauhati Medical
College's. The special rule for it has been removed.

**UG seats are 2026-27.** Leaving out national institutes, the total is exactly 1,36,939,
matching [NMC's July 2026 release](https://www.freepressjournal.in/education/nmc-releases-mbbs-seat-matrix-for-2026-27-136-lakh-seats-available-across-823-medical-colleges).
NMC has since revised that to [1,40,664](https://medicaldialogues.in/amp/news/education/140664-mbbs-seats-across-839-medical-colleges-for-2026-27-127028-renewed-13636-increased-nmc-updates-seat-matrix-179737), so our seat data is behind.

`npm run data:check` repeats these comparisons on every build.

## Fees

`src/data/fees.json` holds published annual fees, one row per college, course and seat type (government, private, management or NRI),
with the year and source. College pages show these where they exist, and a labelled estimate by college type everywhere else. Bond terms
are still estimates.

| Source | Covers | Notes |
|---|---|---|
| KEA allotment lists | 68 Karnataka colleges, 194 seat types | One fee per college and seat type, as printed beside each allotment. 2026 where present, otherwise 2025. A fee of 0 is treated as not published |
| [OJEE's Round 3 admission notice](https://odishajee.com/news_document/Notice_3rd_round_Reporting_R_560.pdf) | All 14 Odisha government colleges and its 3 private ones | Government colleges charge ₹37,950 a year. NRI fees are four times the private fee, as the notice states, so those are worked out |
| [Puducherry's fee order of 28 August 2026](https://drive.google.com/file/d/1ulK5ZSkqgWfZT6NwCN5LBkYD13GrOJbK/view) | PIMS and Sri Manakula Vinayagar | Government, management and NRI seats, for 2026-27 to 2028-29. The table is a scanned image and was read by eye. Sri Venkateshwaraa's fee is under a High Court stay |
| [Uttar Pradesh's fee orders on upneet.gov.in](https://upneet.gov.in/) | 32 private colleges by government order, 4 minority colleges, Integral, and ESIC Noida and Varanasi | Tuition fee only, for 2026-27. The orders are scanned and were read by eye. They open from the home page notices, which have no direct address. Minority colleges set their own fee and declare it to DGME. Prasad (Unnao), Radha Govind (Meerut) and Mayo (Barabanki) are in the orders but not on this site |
| [DME Madhya Pradesh's fee report](https://dme.mponline.gov.in/Portal/Services/DMEMP/College/RptSubjectFeeDetailsUG.aspx) | All 34 MBBS colleges in the state counselling | Tuition for government, private and NRI seats. Private colleges also charge a development fee of about 15 to 18% of tuition, left out here. A live report, read on 6 November 2026 |
| [Tamil Nadu's prospectus 2026-27](https://tnmedicalselection.net/news/30062026003157.pdf) | 36 government colleges, ESIC K.K. Nagar and 27 self-financing colleges | Government quota seats only. Government colleges charge ₹6,000 tuition (₹18,073 with other fees). Management and NRI fees are in the management quota prospectus, listed below |
| [Telangana's fee order for 2026-29](https://www.knruhs.telangana.gov.in/wp-content/uploads/notifications/20260811063812_KNRUHS-MBBS-BDS-ADMISSIONS-FOR-THE-AY-2026-27-NOTICE-WITH-REGARD-TO-TUITION-FEE-FOR-MBBS-AND-BDS-COURSES-FOR-THE-BLOCK-PERIOD-2026-29.pdf) | 27 private colleges | G.O.Ms.No.98 of 2026 keeps the 2023 fees (G.O.Ms.No.106, and No.132 for Deccan). Category A seats, filled by state counselling, are ₹60,000 a year everywhere; Category B (management) is ₹11.55 to 13.9 lakh. NRI seats are only capped at twice Category B, so they aren't listed. Scanned, read by eye. Government colleges publish their own fees, so they aren't covered. Neelima had its own order in 2024 and isn't in the 2023 table |
| Rajasthan NEET UG Counselling Board's fee documents for 2026: [private colleges](https://ug.neetrajasthan.com/notifications/1787320285906.pdf), [government, RUHS and RajMES colleges](https://ug.neetrajasthan.com/notifications/1786878970509.pdf), [ESIC](https://ug.neetrajasthan.com/notifications/1786813957760.pdf) | 18 private colleges, 31 government, RUHS and RajMES colleges, ESIC Alwar and Jaipur | Tuition only. Government, RUHS and RajMES colleges charge ₹73,900 on a government seat by a 2022 state order; RUHS and the 24 RajMES colleges also have management seats at ₹10,05,100. Private colleges' general (state quota) seats are ₹18.9 to 24.95 lakh, as each college declared; some are before the courts. NRI seats at government colleges are priced in US dollars, so they aren't listed |
| Gujarat Fee Regulatory Committee (Medical): [MBBS fees for 2025-26 and 2026-27](https://frcmedical.org/2025/MBBS_FEE_STRUCTURE_FOR_THE_YEAR_2025_26_AND_2026_27.PDF) and [Bhagyoday's order](https://frcmedical.org/2025/ORDER.pdf) | 17 self-financed colleges and the municipal colleges NHL, Narendra Modi and SMIMER | The fee for students admitted in 2026-27: ₹9.3 to 12.54 lakh on a government (state quota) seat and ₹18.9 to 28.85 lakh on a management seat. Scanned, read by eye. Matushri Prabhaben (Atkot) isn't in any order found. GMERS and state government colleges aren't set by this committee, and the admission committee's only government fee notice dates from 2018, so they aren't covered |
| [Andhra Pradesh's interim fee order for 2026-27](https://drntr.uhsap.in/index/pdf/Admission/GOS/2026HMF_RT785_E.pdf) (G.O.Rt.No.785) | All 19 private colleges in the state counselling | One fee for every private unaided college: ₹18,150 on an A-Category (state counselling) seat and ₹14,52,000 on a B-Category (management) seat. NRI seats are only capped, so they aren't listed. Interim: 10% above 2025-26, to be replaced by the fee commission's final fee, with court cases pending. Government colleges aren't covered |
| CEE Kerala's [MBBS option registration notification](https://cee.kerala.gov.in/keam2026/noti_view/201/Upload1) and [PIMS notice](https://cee.kerala.gov.in/keam2026/noti_view/216/Upload1), KEAM 2026 | 14 government colleges and 21 self-financing colleges | Government colleges ₹23,150 a year. Self-financing colleges: general (85%) seats ₹8.1 to 9.31 lakh, listed as private seats, and NRI (15%) seats ₹21.66 to 22.74 lakh. These are the 2025-26 fees, paid provisionally until the 2026-27 fee is fixed. Azeezia and Sree Narayana are self-financing though this site lists them as government. Kannur Medical College isn't in the list |
| [BCECEB's Fee Structure of UGMAC-2026](https://bceceboard.bihar.gov.in/pdf_Web/TEMP_UGMAC26_FSTR.pdf) | 14 private colleges in Bihar and IGIMS Patna | Each college's letter to the board, most citing Bihar's Educational Fee Fixation Committee orders of August and September 2026. Tuition on a general seat ₹11.05 to 16.5 lakh; IGIMS ₹1,21,667. Shrinivas's fee is marked proposed. Scanned, read by eye. NRI fees are in US dollars. Bihar's government colleges aren't covered |
| [Chhattisgarh's interim fee order of 23.09.2025](https://drive.google.com/file/d/1eqQmwyVY4k58PkMsfGiJNnnJm2pxza8K/view) (on cgdme.in) | Shri Balaji, Shri Rawatpura and Abhishek Mishra | One fee per student for 2024-25 to 2026-27: ₹8,02,700 and ₹7,45,187. Shankaracharya, RIMS, Maa Padmavati and government colleges aren't covered |
| [UHSR Rohtak's provisional tuition fee notice of 02.09.2026](https://uhsrugcounselling.com/Images/Notifications/163.PDF) | 7 government colleges, ESIC Faridabad and 8 private colleges in Haryana | Government ₹80,000; ESIC ₹1,00,000; private ₹1.8 to 11.25 lakh. NRI fees are in US dollars. MM Mullana and Amrita Faridabad aren't in it |
| [BFUHS MBBS/BDS prospectus 2026](https://admission.bfuhsonline.ac.in/MBBS2026/Prospectus.pdf), clause 14 | 4 government and 6 private colleges in Punjab | First-year fee, which rises each year: government ₹2,02,000; private government quota ₹4,69,000 and management quota ₹12,06,000; SGRD ₹12,06,000. CMC Ludhiana's fee can't be worked out from the text, and ESIC Ludhiana isn't covered |
| [HNBUMU NEET UG 2026 counselling portal](https://meta-secure.com/HNBUMU_NEETUG): government college fee GO and private college fee notices | 5 government colleges, HIMS, SGRR and Gautam Buddha in Uttarakhand | Government ₹1,45,000 without the service bond (₹50,000 with it). Private colleges ₹15.75 to 18 lakh on an Uttarakhand quota seat, listed as private seats; all-India open seats ₹21 to 24 lakh. Scanned, read by eye. Graphic Era isn't covered |
| [AMRU Himachal Pradesh MBBS/BDS prospectus 2026](https://amruhp.ac.in/wp-content/uploads/2026/08/Final-Prospectus-for-MBBS-BDS-counselling-2026-final.pdf), Section X | 6 government colleges and MM Kumarhatti | Government ₹40,000 tuition. MM Kumarhatti, first year: ₹8,47,000 state quota and ₹15,97,200 management, rising each year |
| JCECEB's college fee notices for 2026-27: [Laxmi Chandravansi](https://blobstorage2.blob.core.windows.net/jceceb/notifications/2111.pdf), [Sido Kanhu](https://blobstorage2.blob.core.windows.net/jceceb/notifications/2112.pdf), [Manipal Tata](https://blobstorage2.blob.core.windows.net/jceceb/notifications/2120.png) | 3 Jharkhand colleges | ₹12.69 to 15 lakh. Sido Kanhu's is proposed. Netaji Subhas gives only a combined tuition, hostel and mess figure, so it isn't listed. Jharkhand's government colleges aren't covered |
| [Maharashtra Fees Regulating Authority's 2026-27 fee search](https://ay26-27.mahafraportal.org/ssi_prp_25/outer.php?q=fee_search_report) (Medical, MBBS, all districts) | 19 private unaided colleges in Maharashtra | Approved yearly tuition, the same for every state counselling seat: ₹6.82 to 15.57 lakh, plus a development fee. A live report, read on 7 November 2026. Deemed universities, government colleges and NRI seats aren't covered. NKP Salve, Nagpur, isn't on this site |
| [Maharashtra State CET Cell's NEET UG 2025-26 brochure](https://statecetcell.s3.ap-south-1.amazonaws.com/Old+Notifications/NEET-UG25_IB.pdf), section 19 | 41 government, government-aided and municipal colleges in Maharashtra | Tuition ₹1,52,100 a year plus ₹5,000 development fee. The 2025-26 fee: no 2026-27 brochure has been published |
| [Tamil Nadu's management quota prospectus 2026-27](https://tnmedicalselection.net/news/28062026235144.pdf), clause 20 | 27 self-financing colleges and CMC Vellore | Management quota ₹15 lakh and NRI ₹27 lakh at most colleges; ₹16.2 lakh and ₹30 lakh at five state private university colleges; CMC Vellore minority seats ₹56,330 |
| [MCC's NEET UG 2026 institute fee proformas](https://mcc.admissions.nic.in/Applicant/Report/ViewInstituteProfileDynamic.aspx?agencyid=140&boardid=140032621) (Annexure C, one per institute; the PDFs are saved under `data/raw/mcc/pdfs/fees/`) | 28 deemed and private universities, 9 Telangana and 8 Andhra Pradesh government colleges, 5 ESIC colleges, Bhavnagar, Safdarjung, Raigarh and GMC Jammu | Each college fills in its own form. Only tuition or the yearly college fee is used: deemed universities ₹19 to 31 lakh, Telangana ₹29,000 (OC/BC), Andhra Pradesh ₹15,000, ESIC ₹1,00,000. Vizianagaram also states ₹12 lakh self-financing and ₹20 lakh NRI fees. Hamdard's is the first-year fee; Chettinad's is the four-year option. Forms with only an all-in amount at admission, a link to the college website or 0 were left out, as were AIIMS (₹5,856 for the whole course) and NRI fees in US dollars |

Fees read by hand from a notice go in `data/curated/fees.json`, with the document named for each.

`npm run data:check` rejects a fee for an unknown college or seat type, an amount outside ₹1,000 to ₹1 crore a year, or a row without a source and year.

## Known problems

- Cutoffs cover two years, which shows a direction but not a reliable trend. MCC's archive goes
  back to 2019 if more years are wanted.
- State-quota cutoffs cover Karnataka, Bihar, Chhattisgarh, Rajasthan, Gujarat, Andhra Pradesh, Telangana, Haryana, Maharashtra, Punjab, Himachal Pradesh, Madhya Pradesh, Tamil Nadu, Kerala, Uttar Pradesh, West Bengal, Odisha, Puducherry and Uttarakhand only. PG cutoffs cover MCC's All India rounds only: no state quota and no DNB. The site shows Round 1 only, for UG and PG alike, so the later rounds are in the data but not yet on any page. Published fees cover Karnataka, Odisha, Puducherry, Uttar Pradesh, Madhya Pradesh, Tamil Nadu, Telangana's private colleges, Rajasthan, Gujarat's self-financed and municipal colleges, Andhra Pradesh's private colleges, Kerala, Bihar's private colleges, three Chhattisgarh colleges, Haryana, Punjab, Uttarakhand, Himachal Pradesh, three Jharkhand colleges, Maharashtra, Tamil Nadu's management and NRI seats, and 54 colleges from MCC's institute fee proformas so far. Jammu and Kashmir's brochure tells students to ask each college. West Bengal and Assam publish no usable official fee list (Assam's information bulletin link is broken). Maharashtra's private colleges are now covered. Deemed universities have no single official fee list, so they are covered only where MCC's proforma names tuition. Most government colleges' proformas give only an all-in amount at admission, which includes hostel and deposits, so they are left out.
- Of the site's 926 colleges, 81 have no UG seats in our data, so most of them can't have UG cutoffs.
- 18 MBBS colleges still have no cutoffs: Jharkhand's 3 (separate portal, own merit rank), 6 in Tripura, Jammu and Kashmir, Sikkim, Manipur
  and Meghalaya, the 2 armed forces colleges, and 7 not in any state list found.
- 7 Karnataka colleges have no KEA rows: Chettinad Kolar, Kasturba Manipal, Raja Rajeswari, Shri B M Patil,
  Sri Devaraj Urs and the two Sri Siddhartha colleges. They're probably outside KEA's counselling, but that isn't confirmed.
- Bagalkote Medical College is in KEA's and MCC's lists but not in our college list.
- 4 Karnataka colleges filled more Round 1 seats than NexDoc's seat data shows, such as Karwar (170 against
  150). KEA's own matrix should replace those seat counts.
- 12 colleges have All India seats in NexDoc's seat data but no MCC allotments, including the
  Gujarat GMERS colleges and Armed Forces Medical College. The seat data may be wrong for them.
- 8 colleges on MCC's list aren't in our college list, so their 323 MBBS allotments are left out: AIIMS
  Rewari, CAPFIMS Delhi, and the medical colleges at Bagalkote, Bongaigaon, Chapra, Pithoragarh,
  Ahilyanagar and Samastipur. See `data/curated/mcc-college-overrides.json`.
- Dental colleges aren't on the site, so most BDS rows aren't used.
- Bhaarath Medical College has MCC cutoffs but no seats in NexDoc's data.
- Chikkaballapura Institute of Medical Sciences and Nandi Medical College are one college listed twice in NexDoc.
  Cutoffs are on Nandi (`ug_ka027g1`), as KEA names it.
- Chamarajanagar appears twice in NexDoc's list (`ug_ka004g1` and `ug_ka005g1`). Only the second
  has seats and cutoffs.
- NexDoc's seat data shows only 15 All India seats at BHU and 22 at Aligarh, while MCC allotted
  100 and 72 in 2026 Round 1. Treat seat counts at central universities with care.
- Seats have no category split.
- College photos are switched off, so every college shows its initials. See
  `data/curated/college-photos-to-review.json`.
- NIRF ranks in `data/curated/college-extras.json` were carried over from the old data.
  Their source and year are unknown, so check them against nirfindia.org.
