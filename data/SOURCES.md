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
kept in git because they're large: `npm run data:mcc:download` fetches them again. The rows
taken from them are in `data/extracted/mcc/`.

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
- There are no state-quota cutoffs, PG cutoffs or real fees.
- 330 of 845 UG colleges have no cutoffs: 295 private, 32 government and 3 deemed. MCC doesn't
  allot these seats in the files we hold. Most fill seats only through state counselling, which
  Phase 3 adds.
- 12 colleges have All India seats in NexDoc's seat data but no MCC allotments, including the
  Gujarat GMERS colleges and Armed Forces Medical College. The seat data may be wrong for them.
- 8 colleges on MCC's list aren't in our college list, so their 323 MBBS allotments are left out: AIIMS
  Rewari, CAPFIMS Delhi, and the medical colleges at Bagalkote, Bongaigaon, Chapra, Pithoragarh,
  Ahilyanagar and Samastipur. See `data/curated/mcc-college-overrides.json`.
- Dental colleges aren't on the site, so most BDS rows aren't used.
- Bhaarath Medical College and Chikkaballapura have MCC cutoffs but no seats in NexDoc's data.
- Chamarajanagar appears twice in NexDoc's list (`ug_ka004g1` and `ug_ka005g1`). Only the second
  has seats and cutoffs.
- NexDoc's seat data shows only 15 All India seats at BHU and 22 at Aligarh, while MCC allotted
  100 and 72 in 2026 Round 1. Treat seat counts at central universities with care.
- Seats have no category split.
- College photos are switched off, so every college shows its initials. See
  `data/curated/college-photos-to-review.json`.
- NIRF ranks in `data/curated/college-extras.json` were carried over from the old data.
  Their source and year are unknown, so check them against nirfindia.org.
