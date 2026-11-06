/**
 * Downloads the result PDFs listed in data/raw/<source>/sources.json and confirms each
 * is byte-for-byte the file we used, using its sha256 fingerprint.
 *
 * Usage: npm run data:download
 *
 * The PDFs aren't kept in git because they're large. A changed fingerprint means the
 * publisher replaced the file: compare the two before trusting the new one.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
let failed = 0;

for (const publisher of ["mcc", "mcc-pg", "kea"]) {
const RAW = path.join(ROOT, "data/raw", publisher);
const PDFS = path.join(RAW, "pdfs");
const sources = JSON.parse(fs.readFileSync(path.join(RAW, "sources.json"), "utf8"));
fs.mkdirSync(PDFS, { recursive: true });

for (const source of sources) {
  const file = path.join(PDFS, `${source.name}.pdf`);
  if (!fs.existsSync(file)) {
    const response = await fetch(source.url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) {
      console.log(`FAILED   ${source.name}: HTTP ${response.status}`);
      failed++;
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  }
  const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if (hash === source.sha256) {
    console.log(`OK       ${publisher} ${source.name}`);
  } else {
    console.log(`CHANGED  ${source.name}: this isn't the file we recorded`);
    failed++;
  }
}

}

if (failed > 0) process.exit(1);
