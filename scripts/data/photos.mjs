/**
 * College photos from Wikimedia Commons, the free photo library behind Wikipedia.
 *
 *   node scripts/data/photos.mjs          find candidates  -> data/extracted/college-photo-candidates.json
 *   node scripts/data/photos.mjs --pick   choose one each  -> data/curated/college-photos.json
 *
 * How a college gets a photo:
 *  1. Search English Wikipedia for the college. Keep an article only if its title names the same
 *     college (the distinctive words must match, so "AIIMS Bhopal" never takes "AIIMS Bhubaneswar").
 *  2. Collect candidate photos: the Wikidata image (P18), the article's lead photo, the photos in the
 *     college's Commons category, and a Commons file search by name.
 *  3. Keep only photos under a licence that allows reuse with credit (CC BY, CC BY-SA, CC0, public
 *     domain), big enough, landscape, and not a logo, map or event photo by their file name.
 *  4. A person looks at every chosen photo. Wrong or poor ones go in college-photo-rejects.json and
 *     --pick moves on to the next candidate.
 *
 * Photos are linked, not copied: the site loads standard-width thumbnails from upload.wikimedia.org
 * and shows the author and licence next to each one, as the licences require.
 * Responses are cached in data/raw/wikimedia/ (not committed) so reruns are fast and polite.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const CACHE_DIR = path.join(ROOT, "data/raw/wikimedia");
const CACHE_FILE = path.join(CACHE_DIR, "cache.json");
const CANDIDATES = path.join(ROOT, "data/extracted/college-photo-candidates.json");
const REJECTS = path.join(ROOT, "data/curated/college-photo-rejects.json");
const CHOSEN = path.join(ROOT, "data/curated/college-photos.json");
const EARLIER = path.join(ROOT, "data/curated/college-photos-to-review.json");
const UA = "gined.in-photo-match/1.0 (https://gined.in; college data pipeline)";

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback);
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");

/* ── Polite, cached requests ───────────────────────────────────────────── */

fs.mkdirSync(CACHE_DIR, { recursive: true });
const cache = readJson(CACHE_FILE, {});
let sinceSave = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  if (cache[url]) return cache[url];
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(120);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip" }, signal: AbortSignal.timeout(30_000) });
      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      const json = await res.json();
      cache[url] = json;
      if (++sinceSave >= 50) saveCache();
      return json;
    } catch {
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error(`Gave up on ${url}`);
}
function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
  sinceSave = 0;
}
const api = (host, params) => get(`https://${host}/w/api.php?` + new URLSearchParams({ format: "json", formatversion: "2", ...params }));

/* ── Names: which words say which college it is ────────────────────────── */

const SAME = {
  govt: "government", gov: "government", med: "medical", inst: "institute", sci: "sciences", science: "sciences",
  hosp: "hospital", hospitals: "hospital", res: "research", center: "centre", ctr: "centre", coll: "college", st: "saint", sri: "shri", sree: "shri", shree: "shri",
  mangalore: "mangaluru", bangalore: "bengaluru", allahabad: "prayagraj", bombay: "mumbai", calcutta: "kolkata", madras: "chennai",
  gurgaon: "gurugram", baroda: "vadodara", mysore: "mysuru", trivandrum: "thiruvananthapuram", cochin: "kochi", calicut: "kozhikode",
  poona: "pune", belgaum: "belagavi", gulbarga: "kalaburagi", hubli: "hubballi", bellary: "ballari", shimoga: "shivamogga",
  tumkur: "tumakuru", bijapur: "vijayapura", pondicherry: "puducherry", pondy: "puducherry", vizag: "visakhapatnam",
  benares: "varanasi", banaras: "varanasi", cawnpore: "kanpur", trichy: "tiruchirappalli", tanjore: "thanjavur",
  davangere: "davanagere", chikmagalur: "chikkamagaluru", kolar: "kolar", hassan: "hassan",
};
const GENERIC = new Set(
  ("and of the for in at a an all medical college colleges government hospital institute institutes sciences research centre education post graduate " +
    "postgraduate pg health university campus district general memorial trust society india indian state national teaching dental " +
    "medicine school academy faculty super speciality specialty multi city new old main branch unit")
    .split(" ")
);
const tokens = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.(jpe?g|png|tiff?|webp)$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((t) => SAME[t] ?? t);
const distinct = (s) => [...new Set(tokens(s).filter((t) => t.length > 1 && !GENERIC.has(t) && !/^\d+$/.test(t)))];

/** How well a Wikipedia title names our college: 0 (not it) to 1. */
function titleScore(college, title) {
  const ours = new Set([...distinct(college.name), ...distinct(college.city)]);
  // The title must name an institution, not just the city (a city article's photo is the city).
  if (!/\b(medical|hospital|health|aiims|jipmer|pgimer|sciences|cancer|hygiene|medicine)\b/i.test(title)) return 0;
  const theirs = distinct(title);
  if (theirs.length === 0) return 0;
  const shared = theirs.filter((t) => ours.has(t));
  const extra = theirs.length - shared.length; // words in the title that our college doesn't have
  if (shared.length === 0 || extra > 0) return 0;
  // Sharing only the city isn't enough when our college's name has words of its own:
  // "Medical College & Hospital, Kolkata" is not "Calcutta National Medical College, Kolkata".
  const city = new Set(distinct(college.city));
  const ownWords = distinct(college.name).filter((t) => !city.has(t));
  if (ownWords.length > 0 && !shared.some((t) => ownWords.includes(t))) return 0;
  const coverage = shared.length / Math.max(1, distinct(college.name).length);
  return Math.min(1, coverage);
}

/* ── Photos: which files are usable ─────────────────────────────────────── */

// File names that point to logos, maps, drawings or events with people rather than the campus.
const BAD_WORDS =
  /logo|emblem|seal|crest|insignia|convocation|minister|president|governor|chief.?minister|inaugur|map\b|locator|signature|ceremony|meeting|award|visit|lecture|portrait|statue|bust|patient|surgery|operation|stamp|cover|poster|banner|certificate|signboard|flag|cake|rally|protest|vaccin|covid|camp\b|present(ing|s)|conference|conclave|wedding|releas|launch|inspect|secretary|souvenir|commandant|dedicat|address|announc|laying|standing|flanked|trophy|director|gen\.|felicitat|celebrat|function|day celebration|seminar|workshop|rendering|proposed|model|drawing|sketch|engraving|stereo|19[0-4]\d|18\d\d/i;
const GOOD_WORDS = /building|campus|college|block|hospital|gate|entrance|front|view|academic|aerial|main|admin|hostel|library|auditorium|facade|wing/i;
// GODL-India is India's Government Open Data Licence: free reuse with credit.
const FREE = (license) => /^(cc0|public domain|pd\b|pd-|cc[ -]by(-sa)?[ -]|godl)/i.test(license) && !/-nc|-nd|\bnc\b|\bnd\b|fair|non-free/i.test(license);

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** File details from Commons, for up to 50 files at once. Files that aren't on Commons come back missing. */
async function fileInfo(files) {
  const out = new Map();
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50);
    const r = await api("commons.wikimedia.org", {
      action: "query",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "960",
      titles: batch.map((f) => `File:${f}`).join("|"),
    });
    const normalized = new Map((r.query?.normalized ?? []).map((n) => [n.to, n.from]));
    for (const page of r.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      if (page.missing || !info) continue;
      const meta = info.extmetadata ?? {};
      const file = page.title.replace(/^File:/, "");
      const thumb = info.thumburl?.replace(/^https:\/\/thumb\.wikimedia\.org/, "https://upload.wikimedia.org").split("?")[0];
      out.set((normalized.get(page.title) ?? page.title).replace(/^File:/, ""), {
        file,
        width: info.width,
        height: info.height,
        mime: info.mime,
        license: stripHtml(meta.LicenseShortName?.value),
        licenseUrl: meta.LicenseUrl?.value ?? null,
        author: stripHtml(meta.Artist?.value) || null,
        credit: stripHtml(meta.Credit?.value) || null,
        page: info.descriptionurl,
        // A thumbnail address with {w} for the width; only standard widths exist.
        thumb: thumb && /\/960px-/.test(thumb) ? thumb.replace("/960px-", "/{w}px-") : null,
        // Photos narrower than 960px have no thumbnails, so the original file is linked instead.
        original: info.url,
      });
    }
  }
  return out;
}

function usable(info) {
  if (!info) return "not on Commons";
  if (!info.thumb && info.width > 2000) return "no thumbnail";
  if (!FREE(info.license)) return `licence ${info.license || "unknown"}`;
  if (!/jpeg|png|webp|tiff/.test(info.mime)) return `type ${info.mime}`;
  if (info.width < 800) return "too small";
  const ratio = info.width / info.height;
  if (ratio < 1.05 || ratio > 2.6) return "not landscape";
  if (BAD_WORDS.test(info.file)) return "file name suggests a logo, map or event";
  return null;
}

/* ── Find candidates ───────────────────────────────────────────────────── */

async function findArticle(college) {
  const name = college.name.replace(/,\s*(madhya pradesh|uttar pradesh|tamil nadu|andhra pradesh|west bengal|[a-z ]+ pradesh)$/i, "");
  const titles = new Set();
  for (const q of [name, `${name} ${college.city}`]) {
    const r = await api("en.wikipedia.org", { action: "query", list: "search", srsearch: q, srlimit: "5", srnamespace: "0" });
    for (const hit of r.query?.search ?? []) titles.add(hit.title);
  }
  let best = null;
  for (const title of titles) {
    const score = titleScore(college, title);
    if (score >= 0.6 && (!best || score > best.score)) best = { title, score };
  }
  return best;
}

async function articleDetails(title) {
  const r = await api("en.wikipedia.org", { action: "query", prop: "pageprops|pageimages", piprop: "name", redirects: "1", titles: title });
  const page = r.query?.pages?.[0];
  return { qid: page?.pageprops?.wikibase_item ?? null, leadImage: page?.pageimage ?? null };
}

async function wikidataPhotos(qid) {
  const r = await api("www.wikidata.org", { action: "wbgetclaims", entity: qid });
  const claim = (p) => r.claims?.[p]?.map((c) => c.mainsnak?.datavalue?.value).filter(Boolean) ?? [];
  return { p18: claim("P18"), category: claim("P373")[0] ?? null };
}

async function categoryFiles(category) {
  const r = await api("commons.wikimedia.org", { action: "query", list: "categorymembers", cmtype: "file", cmlimit: "100", cmtitle: `Category:${category}` });
  return (r.query?.categorymembers ?? []).map((m) => m.title.replace(/^File:/, ""));
}

async function commonsSearch(college) {
  const r = await api("commons.wikimedia.org", { action: "query", list: "search", srsearch: college.name, srnamespace: "6", srlimit: "15" });
  const ours = distinct(college.name);
  return (r.query?.search ?? [])
    .map((hit) => hit.title.replace(/^File:/, ""))
    .filter((file) => {
      const theirs = new Set(distinct(file));
      const shared = ours.filter((t) => theirs.has(t)).length;
      return ours.length > 0 && shared / ours.length >= 0.75;
    });
}

function earlierFiles() {
  const earlier = readJson(EARLIER, {});
  const out = {};
  for (const [id, entry] of Object.entries(earlier)) {
    if (!entry?.url) continue;
    const m = entry.url.match(/\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/([^/]+)\//);
    if (m) out[id] = decodeURIComponent(m[1]).replace(/_/g, " ");
  }
  return out;
}

const SOURCE_RANK = { "wikidata-image": 0, "wikipedia-lead": 1, "commons-category": 2, "earlier-list": 3, "commons-search": 4 };

async function findCandidates() {
  // LIMIT=n checks only the first n colleges, for a quick trial run.
  const colleges = readJson(path.join(ROOT, "src/data/colleges.json"), []).slice(0, Number(process.env.LIMIT) || undefined);
  const earlier = earlierFiles();
  const result = {};
  const stats = { colleges: colleges.length, article: 0, withCandidates: 0 };

  for (const [n, college] of colleges.entries()) {
    const found = []; // { file, source, title? }
    const article = await findArticle(college);
    let match = null;
    if (article) {
      stats.article++;
      const { qid, leadImage } = await articleDetails(article.title);
      match = { title: article.title, score: Number(article.score.toFixed(2)), qid };
      if (qid) {
        const wd = await wikidataPhotos(qid);
        for (const f of wd.p18) found.push({ file: f, source: "wikidata-image" });
        if (wd.category) {
          const files = (await categoryFiles(wd.category)).filter((f) => !BAD_WORDS.test(f));
          files.sort((a, b) => Number(GOOD_WORDS.test(b)) - Number(GOOD_WORDS.test(a)));
          for (const f of files.slice(0, 12)) found.push({ file: f, source: "commons-category" });
          match.category = wd.category;
        }
      }
      if (leadImage) found.push({ file: leadImage.replace(/_/g, " "), source: "wikipedia-lead" });
    }
    if (earlier[college.id]) found.push({ file: earlier[college.id], source: "earlier-list" });
    if (found.length === 0) for (const f of await commonsSearch(college)) found.push({ file: f, source: "commons-search" });

    // Details and checks, one entry per file, best source first.
    const unique = [...new Map(found.map((c) => [c.file.replace(/_/g, " "), c])).values()];
    const infos = await fileInfo(unique.map((c) => c.file.replace(/_/g, " ")));
    const candidates = [];
    const dropped = [];
    for (const c of unique) {
      const info = infos.get(c.file.replace(/_/g, " "));
      const why = usable(info);
      if (why) dropped.push({ file: c.file, source: c.source, why: info ? why : "not on Commons (may not be free)" });
      else candidates.push({ ...info, source: c.source, good: GOOD_WORDS.test(info.file) });
    }
    candidates.sort((a, b) => SOURCE_RANK[a.source] - SOURCE_RANK[b.source] || Number(b.good) - Number(a.good) || b.width - a.width);
    if (candidates.length) stats.withCandidates++;
    result[college.id] = { name: college.name, city: college.city, match, candidates: candidates.map((c) => ({ ...c, good: undefined })), dropped };

    if ((n + 1) % 25 === 0) {
      saveCache();
      console.log(`${n + 1}/${colleges.length} checked, ${stats.article} articles, ${stats.withCandidates} with a usable photo`);
    }
  }
  saveCache();
  writeJson(CANDIDATES, result);
  // One article matched by several colleges usually means a generic name ("Medical College, Kolkata")
  // took another college's article. Check these by eye and reject the wrong ones.
  const byArticle = new Map();
  for (const [id, e] of Object.entries(result)) if (e.match?.qid) byArticle.set(e.match.qid, [...(byArticle.get(e.match.qid) ?? []), `${id} ${e.name}`]);
  for (const [, ids] of byArticle) if (ids.length > 1) console.warn(`Check: one article matched ${ids.length} colleges: ${ids.join("; ")}`);
  console.log(`Done: ${stats.article} of ${stats.colleges} colleges matched a Wikipedia article; ${stats.withCandidates} have a usable photo.`);
}

/* ── Pick one photo each, skipping rejected ones ───────────────────────── */

function pick() {
  const candidates = readJson(CANDIDATES, null);
  if (!candidates) throw new Error("Run without --pick first.");
  const rejects = readJson(REJECTS, { files: {}, colleges: {} });
  const usedFiles = new Set();
  const chosen = {};
  for (const [id, entry] of Object.entries(candidates)) {
    if (rejects.colleges?.[id]) continue;
    const next = entry.candidates.find((c) => !rejects.files?.[`${id}|${c.file}`] && !rejects.files?.[c.file] && !usedFiles.has(c.file));
    if (!next) continue;
    usedFiles.add(next.file);
    chosen[id] = {
      file: next.file,
      thumb: next.thumb,
      ...(next.thumb ? {} : { src: next.original }),
      width: next.width,
      height: next.height,
      author: next.author,
      license: next.license,
      licenseUrl: next.licenseUrl,
      page: next.page,
      source: next.source,
    };
  }
  writeJson(CHOSEN, { _note: "Written by scripts/data/photos.mjs --pick. Every photo was looked at by a person; wrong ones are listed in college-photo-rejects.json.", ...chosen });
  console.log(`${Object.keys(chosen).length} colleges have a photo.`);
}

if (process.argv.includes("--pick")) pick();
else await findCandidates();
