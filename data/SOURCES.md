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

**Karnataka's state-quota cutoffs come straight from KEA.** The eight result PDFs are listed in
`data/raw/kea/sources.json`: 2025 and 2026, Rounds 1 to 3 and the first stray round. Retrieved 5 November
2026 from <https://cetonline.karnataka.gov.in/kea/ugneet2026> and the 2025 page beside it. KEA's lists hold
no student names. The rows taken from them are in `data/extracted/kea/`. They also hold each seat's fee,
which isn't used on the site yet (Phase 4).

**Bihar, Chhattisgarh, Rajasthan, Gujarat, Andhra Pradesh, Telangana, Haryana, Maharashtra, Punjab, Himachal Pradesh, Madhya Pradesh, Tamil Nadu and Kerala come straight from their counselling authorities.** The files
are listed in `data/raw/states/sources.json`, `gj.json`, `ap.json`, `tg.json`, `mh.json`, `pb.json`, `hp.json`, `mp.json`, `tn.json` and `kl.json`. These lists include student names, so the extractors keep only rank, college, course, category,
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
| Tamil Nadu | 2026, Rounds 1 to 3 and stray, government and management quota, all marked provisional. **Ranks are Tamil Nadu's own, not All India.** The 7.5% government school lists aren't included | 18 of [neet2seat's](https://neet2seat.com/guides/tamil-nadu/tamil-nadu-mbbs-cutoffs-2026) reserved category closing ranks, at Madras, Stanley and Kilpauk, match. Its Open figures differ slightly, as explained below |
| Kerala | 2026, Phases 1 to 3 and stray. **Ranks are KEAM medical ranks, not All India** | All 378 of the state's own Phase 1 last ranks for the 13 seat codes we offer match |
| Madhya Pradesh | 2026, Rounds 1 and 2 and mop-up (mop-up marked provisional). No stray result was linked | All 886 of its own closing rank and seat count figures, across the three rounds, match what we calculate from its student lists. The Round 1 closing rank table comes from a Medical Dialogues copy, and its student list copy was byte-identical to the official file |
| Punjab | 2026, Rounds 1 to 3 and stray. Round 1 and stray are marked provisional | 15 closing All India ranks across Rounds 1 to 3 match [neet2seat](https://neet2seat.com/guides/punjab/punjab-mbbs-cutoffs-2026). The 2,410 students listed in Round 1 match [Careers360](https://news.careers360.com/punjab-neet-counselling-2026-round-1-seat-allotment-out-mbbs-bds-dayanand-medical-college-gmc-patiala-top-choice-bfuhs-ggsmch-org). One Round 1 NRI seat, with no rank in any list we read, is left out |
| Himachal Pradesh | 2026, Rounds 1 to 3 and stray, final lists. A second stray round was scheduled but isn't included | No outside figure yet. Each college's Round 1 count fits within its seats |
| Maharashtra | 2026, Round 1 only, marked provisional. Later rounds aren't linked publicly that we could find, and the portal page asks for a login | The 31,047 candidates and 10,509 allotted match [neet2seat](https://neet2seat.com/news/maharashtra-neet-ug-2026-round-1-selection-list). So do its last Open ranks: 47,413 government and 1,14,441 private |
| Andhra Pradesh | 2026, Phases 1 to 3 and competent-quota stray. Management-quota stray rounds aren't read yet | Management Phase 1 count matches [neet2seat](https://neet2seat.com/news/andhra-pradesh-neet-ug-2026-phase-2-web-options-management-quota-allotment) (1,629). Each college's Round 1 count fits its seats, apart from Paderu (71 against 50) |

**Check what a state's "rank" means before using it.** Gujarat's last-merit files use its own state merit numbers, and Tamil Nadu's and Kerala's lists use a state
rank. The site compares against All India ranks, so those numbers can't be used directly. Gujarat's lists also have an All India rank column, which is what we use.

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

## Known problems

- Cutoffs cover two years, which shows a direction but not a reliable trend. MCC's archive goes
  back to 2019 if more years are wanted.
- State-quota cutoffs cover Karnataka, Bihar, Chhattisgarh, Rajasthan, Gujarat, Andhra Pradesh, Telangana, Haryana, Maharashtra, Punjab, Himachal Pradesh, Madhya Pradesh, Tamil Nadu and Kerala only. There are no PG cutoffs or real fees.
- Of the site's 926 colleges, 81 have no UG seats in our data, so most of them can't have UG cutoffs.
- Many of the 845 UG colleges still have no cutoffs. Most fill seats only through states we haven't added yet.
- Tamil Nadu and Kerala publish lists using their own state rank, with no All India rank, so they can't feed the site's predictor as it works today.
- Uttar Pradesh shows results one college at a time through a form, across 120 colleges.
- West Bengal's PDFs have scrambled text.
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
