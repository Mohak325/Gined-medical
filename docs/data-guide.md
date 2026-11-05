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
| **KEA** | Karnataka Examinations Authority. Runs Karnataka's state counselling. |

A cutoff only means something with all of its context: **college + course + quota +
category + round + year**. "Closing rank 695" alone tells you nothing.

## The path data takes

```
data/raw/        Original files, exactly as downloaded. Never edit these.
data/extracted/  Rows taken from MCC's PDFs by a script.
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

## Adding a new MCC result

MCC publishes each round as a PDF that lists students by rank, with no names. This is how
one becomes cutoffs on the site. You need Python and `pip install pymupdf` once.

1. **Find the file.** Look under "Current Events" at <https://mcc.nic.in/current-events-ug/>,
   and under <https://mcc.nic.in/archive-ug/> for older years. Use the one titled "Final", since
   "Provisional" lists often get revised.
2. **Record it.** Save the PDF as `data/raw/mcc/pdfs/2026-special.pdf`, using the same naming
   pattern. Add it to `data/raw/mcc/sources.json`, then to `MCC_ROUNDS` in `scripts/data/build.mjs`.
   Round 2 and Round 3 PDFs have a different layout from the others, and the script recognises
   them from `-r2` or `-r3` in the file name.
3. **Extract the rows:**

```bash
npm run data:mcc:extract
```

   The script reports any row it couldn't read. Serial numbers that skip or ranks that go backwards
   fail the later check. That's how the rank 13767.5 was found: it was at first misread.
4. **Match the colleges:**

```bash
npm run data:mcc:match
```

   Names the script isn't sure of go to `data/curated/mcc-matches-to-review.json`, with its
   three best guesses. **Don't trust the first guess.** Look the college up, then add a line to
   `mcc-college-overrides.json`. Use `"id": null` if it isn't on the site. The build stops if a
   medical college has no decision.
5. **Build and check**, as described above. A new round should only add rows, so a large change
   to older rows means something went wrong.

### How a closing rank is calculated

For one college, course, quota, category, round and year, the closing rank is the highest rank
that received a **new** seat in that round. Students who only kept an earlier seat don't count:
the 2026 lists include them as "Retained", the 2025 lists leave them out, and skipping them
makes both years mean the same thing.

The category is the one the seat was allotted under, not the student's own. An OBC student who
wins an Open seat counts towards the Open closing rank.

### Why college matching needs care

Two checks caught mistakes the script made:

- **Same PIN code doesn't mean same college.** Terna and two other colleges share a PIN in Navi
  Mumbai.
- **The source can be wrong.** The Pune and Sangli PINs for Bharati Vidyapeeth are swapped, so
  trusting them would have swapped those colleges' cutoffs.

## Adding another state

Every state publishes differently, so start by reading before writing any code.

1. **Find the state's authority.** Look for its final allotment lists, by round, for at least two years.
2. **Read its bulletin first.** Note what each seat type and category code means, and who is eligible. Don't assume
   a state's categories match the national ones. Karnataka's `2A` isn't simply "OBC".
3. **Check the layout.** Do the files hold ranks, or marks? All India ranks, or a state rank? Do they include students
   who only kept an earlier seat? Is there a stable college code to match on? Karnataka's is, so `data/curated/kea-college-codes.json`
   is a short list checked by hand.
4. **Write three pieces,** copying the Karnataka ones: an extractor (`kea_extract.py`), a label table (`kea-lib.mjs`) and a
   college list. Add the rounds to `scripts/data/build.mjs`.
5. **Add spot checks** to `scripts/data/check.mjs` from a report that didn't come from your own work.
6. **Add the state to the predictor,** with its own categories, as `src/lib/medical/karnataka.ts` does.

## Five habits that prevent bad data

1. **Keep the original.** Save source files untouched, and record where and when you got them in `data/SOURCES.md`.
2. **Never assume a year or label.** Prove it by matching a few numbers against an outside source. This project once labelled 2025 cutoffs as 2024 because of one typed-in number.
3. **Match on IDs, not names.** The same college can appear under several names. Fuzzy name matching gave some colleges another college's cutoffs here. Use a shared ID, or a hand-checked list like `data/curated/mcc-college-overrides.json`.
4. **Read the labels before merging them.** Children-of-armed-forces seats were once grouped with central quotas, with closing ranks near 6 lakh, which could mislead an ordinary student.
5. **Turn every bug into a check.** When you find a new kind of error, add a test to `scripts/data/check.mjs` so it can't return quietly.

## Common tasks

**A college's NIRF rank is wrong, or you've checked a photo.** Edit `data/curated/college-extras.json`, then rebuild. A photo needs a working link and any credit its licence requires.

**The build says a college has no match.** Run `npm run data:mcc:match` and work through the review list, as described above.

**The build says there's an unknown quota.** Find out who that quota is for before adding it to the table in `scripts/data/mcc-lib.mjs`. If it has its own eligibility rules, map it to `special`.

**A new source file arrives.** Save it in `data/raw/`, add it to `data/SOURCES.md`, update `build.mjs`, and add spot checks from an independent source.

## Limits of the current data

`data/SOURCES.md` lists every known gap. The biggest are state-quota cutoffs and real fees.
