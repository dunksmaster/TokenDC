/**
 * Sitewide encoding / icon fixes. Run: node scripts/apply-encoding-fixes.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ROOT_HTML = [
  "index.html",
  "about.html",
  "contact.html",
  "service.html",
  "roadmap.html",
  "feature.html",
  "faq.html",
  "events.html",
  "donation.html",
  "bitcoin-for-corporations.html",
  "privacy.html",
  "terms.html",
  "404.html",
  "$10.html",
];

const FA_65 =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";

/** @param {string} before @param {string} after */
function countDiff(before, after) {
  if (before === after) return 0;
  let n = 0;
  const max = Math.max(before.length, after.length);
  for (let i = 0; i < max; i++) {
    if (before[i] !== after[i]) n++;
  }
  return Math.max(1, Math.ceil(n / 8));
}

/** @param {string} t */
function fixHtml(t) {
  let n = 0;
  const before = t;

  // Font Awesome: single 6.5.0 (fa-x-twitter, fas icons)
  t = t.replace(
    /<link[^>]+font-awesome\/(?:5\.10\.0|6\.4\.0)[^>]*>/gi,
    `<link href="${FA_65}" rel="stylesheet">`,
  );
  // Dedupe if both 5.10 and 6.4 were present (about.html)
  const faLink = `<link href="${FA_65}" rel="stylesheet">`;
  let seen = 0;
  t = t.replace(
    new RegExp(faLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    (m) => (++seen > 1 ? "" : m),
  );

  // Em dash in HTML (not inside <script>) — use &mdash;
  const parts = t.split(/(<script[\s\S]*?<\/script>)/gi);
  t = parts
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/—/g, "&mdash;")))
    .join("");

  // donation.html ramen emojis → Font Awesome
  t = t.replace(
    /drowning in ramen noodles 🍜📚/g,
    'drowning in ramen noodles <i class="fas fa-bowl-food me-1" aria-hidden="true"></i><i class="fas fa-book" aria-hidden="true"></i>',
  );

  const fixes = countDiff(before, t);
  return { t, fixes: before === t ? 0 : fixes };
}

const report = [];

for (const file of ROOT_HTML) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) continue;
  const raw = fs.readFileSync(fp, "utf8");
  const { t, fixes } = fixHtml(raw);
  if (t !== raw) {
    fs.writeFileSync(fp, t, "utf8");
    report.push({ file, fixes, note: "FA 6.5, &mdash;, donation icons" });
  }
}

// css/js scan: replacement char only
for (const rel of ["css/brand-logos.css", "js/events-supporters.js"]) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) continue;
  let t = fs.readFileSync(fp, "utf8");
  const next = t.replace(/\uFFFD/g, "\u2014").replace(/ï¿½/g, "\u2014");
  if (next !== t) {
    fs.writeFileSync(fp, next, "utf8");
    report.push({ file: rel, fixes: 1, note: "replacement char" });
  }
}

console.log(JSON.stringify(report, null, 2));
console.log("Total files changed:", report.length);
