# Data sources

Where every dataset comes from, which year it covers, and how we know.
Update this file whenever a source changes.

## Current sources

| Dataset | File in `data/raw/nexdoc/` | Year | Original publisher | How we got it |
|---|---|---|---|---|
| College list | `colleges_details.json` | Snapshot from July 2026 | NMC | Second-hand, from NexDoc |
| UG seats | `ug_all.json` | 2026-27 | NMC, MCC, states | Second-hand, from NexDoc |
| PG seats | `pg_all.json` | Not stated | NMC, MCC, states | Second-hand, from NexDoc |
| UG All India cutoffs | `ug_colleges_aiq_mapping.json` | 2025, Rounds 1 to 3 | MCC | Second-hand, from NexDoc |

**NexDoc:** <https://github.com/deekshithvodela/nexdoc>, copied at the commit in
`data/raw/nexdoc/COMMIT` (last updated 15 August 2026). Its licence files are saved
beside the data. They allow commercial use and require credit, a link to the licence
and a note that we changed the data, so the site footer credits it.

## How the years were worked out

The source files state no year, so each one had to be confirmed from outside.

**Cutoffs are 2025.** Two figures match press reports of the 2025 MCC Round 1 result:

- AIIMS Delhi, general closing rank 48: [Careers360](https://news.careers360.com/mcc-neet-ug-counselling-2025-round-1-seat-allotment-result-pdf-out-mcc-nic-in-top-48-candidates-get-aiq-mbbs-seats-aiims-delhi)
- Madras Medical College, general closing rank 695: [CollegeDekho](https://www.collegedekho.com/news/madras-medical-college-neet-ug-round-1-allotment-cutoff-2025-analysis-top-700-rank-holders-under-open-category-secure-admission-69894)

The old conversion script had "2024" typed in by mistake.

**UG seats are 2026-27.** Leaving out national institutes, the total is exactly 1,36,939,
matching [NMC's July 2026 release](https://www.freepressjournal.in/education/nmc-releases-mbbs-seat-matrix-for-2026-27-136-lakh-seats-available-across-823-medical-colleges).
NMC has since revised that to [1,40,664](https://medicaldialogues.in/amp/news/education/140664-mbbs-seats-across-839-medical-colleges-for-2026-27-127028-renewed-13636-increased-nmc-updates-seat-matrix-179737), so our seat data is behind.

`npm run data:check` repeats these comparisons on every build.

## Known problems

- Cutoffs are from one year only, so no real trends can be shown.
- 2026 cutoffs exist but aren't collected yet.
- There are no state-quota cutoffs, PG cutoffs or real fees.
- 483 of 845 UG colleges have no cutoffs. Some real ones are missing: Bangalore Medical
  College has no All India rows in the source, although press reports give it a cutoff.
- Seats have no category split.
- NexDoc's rule for working out closing ranks needs checking against MCC's PDFs.
- AIIMS Guwahati has two sets of rows. We predict from the stricter "Open Seat" set until
  MCC's PDF explains the other. See `scripts/data/build.mjs`.
- College photos are switched off, so every college shows its initials. See
  `data/curated/college-photos-to-review.json`.
- NIRF ranks in `data/curated/college-extras.json` were carried over from the old data.
  Their source and year are unknown, so check them against nirfindia.org.
