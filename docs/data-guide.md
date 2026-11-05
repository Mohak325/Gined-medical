# How the site's data works

A beginner's guide to where the data comes from, how it reaches the website, and how
to update it yourself. No prior knowledge assumed.

## The words you need

| Term | Meaning |
|---|---|
| **NEET rank (AIR)** | A student's All India Rank. Lower is better. |
| **NMC** | National Medical Commission. Decides which colleges may admit students, and how many. |
| **MCC** | Medical Counselling Committee. Runs national seat allotment. |
| **Counselling** | The rounds in which students choose colleges and receive seats. |
| **AIQ** | All India Quota. Run by MCC and open to students from any state. |
| **State quota** | Seats run by each state's own authority, mostly for that state's residents. |
| **Allotment list** | The published list of which rank got which seat in a round. |
| **Closing rank (cutoff)** | The highest-numbered rank that got a seat in a group. We calculate it from allotment lists. |
| **Seat matrix** | How many seats each college has, split by quota. |

A cutoff only means something with all of its context: **college + course + quota +
category + round + year**. "Closing rank 695" alone tells you nothing.

## The path data takes

```
data/raw/        Original files, exactly as downloaded. Never edit these.
data/curated/    Facts we added by hand, such as photos and name matches.
      │
      ▼
npm run data:build    Cleans and converts the files (scripts/data/build.mjs)
      │
      ▼
src/data/        What the website reads. Never edit by hand; the next build overwrites it.
      │
      ▼
npm run data:check    Stops you publishing data that is wrong (scripts/data/check.mjs)
```

Keeping the original files separate means any mistake can be fixed in the script and
rebuilt, without collecting the data again.

## Updating the data

Run these from the project folder:

```bash
npm run data:build
```

```bash
npm run data:check
```

Read what `data:check` prints:

- **ERROR** means the data is wrong. Fix it before publishing.
- **WARNING** means a known gap. The site still works.

Then look at what changed before you commit:

```bash
git diff --stat src/data
```

A small update should cause a small change. If thousands of rows move when you expected
ten, stop and find out why.

## Five habits that prevent bad data

1. **Keep the original.** Save source files untouched, and record where and when you got them in `data/SOURCES.md`.
2. **Never assume a year or label.** Prove it by matching a few numbers against an outside source. This project once labelled 2025 cutoffs as 2024 because of one typed-in number.
3. **Match on IDs, not names.** The same college can appear under several names. Fuzzy name matching gave some colleges another college's cutoffs here. Use a shared ID, or a hand-checked list like `data/curated/cutoff-college-crosswalk.json`.
4. **Read the labels before merging them.** Children-of-armed-forces seats were once grouped with central quotas, with closing ranks near 6 lakh, which could mislead an ordinary student.
5. **Turn every bug into a check.** When you find a new kind of error, add a test to `scripts/data/check.mjs` so it can't return quietly.

## Common tasks

**A college's NIRF rank is wrong, or you've checked a photo.** Edit `data/curated/college-extras.json`, then rebuild. A photo needs a working link and any credit its licence requires.

**The build says a cutoff college has no match.** Find the right college in `colleges_details.json` by city and name, add the pair to `cutoff-college-crosswalk.json`, then rebuild.

**The build says there's an unknown quota.** Find out who that quota is for before adding it to the table in `build.mjs`. If it has its own eligibility rules, map it to `special`.

**A new source file arrives.** Save it in `data/raw/`, add it to `data/SOURCES.md`, update `build.mjs`, and add spot checks from an independent source.

## Limits of the current data

`data/SOURCES.md` lists every known gap. The biggest are state-quota cutoffs, more years
of cutoffs, and real fees.
