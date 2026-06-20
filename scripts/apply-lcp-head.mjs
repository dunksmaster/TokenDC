import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const GTAG_RE =
  /<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-BH7BJVBLP2"><\/script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\('js', new Date\(\)\);\s*gtag\('config', 'G-BH7BJVBLP2'\);\s*<\/script>/g;

const GTAG_NEW = `<script defer src="/js/gtag-deferred.js"></script>`;

const GTAG_INLINE_RE =
  /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-BH7BJVBLP2"><\/script>\s*<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\('js', new Date\(\)\);\s*gtag\('config', 'G-BH7BJVBLP2'\);\s*<\/script>/g;

const SPINNER_RE =
  /id="spinner" class="show bg-white position-fixed/g;

const files = [
  "service.html",
  "roadmap.html",
  "contact.html",
  "feature.html",
  "faq.html",
  "404.html",
  "about.html",
  "$10.html",
  "events.html",
  "donation.html",
  "privacy.html",
  "terms.html",
];

for (const file of files) {
  const path = join(root, file);
  let html = readFileSync(path, "utf8");
  const original = html;

  html = html.replace(GTAG_RE, GTAG_NEW);
  html = html.replace(GTAG_INLINE_RE, GTAG_NEW);
  html = html.replace(SPINNER_RE, 'id="spinner" class="bg-white position-fixed');

  if (html !== original) {
    writeFileSync(path, html, "utf8");
    console.log(`updated ${file}`);
  }
}
