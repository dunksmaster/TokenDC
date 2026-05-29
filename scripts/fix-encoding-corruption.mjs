/**
 * One-off repair for UTF-8 corruption (U+FFFD, mojibake, ?? emoji placeholders, lone ? em dashes).
 * Run: node scripts/fix-encoding-corruption.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP_DIRS = new Set(["dist", "node_modules", ".git"]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(html|md)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

const EM_HTML = "&mdash;";
const ARROW_HTML =
  '<i class="fas fa-arrow-right text-primary me-1" aria-hidden="true"></i>';
const ARROW_INLINE_HTML =
  '<i class="fa fa-arrow-right ms-1" aria-hidden="true"></i>';

/** @param {string} t @param {boolean} html */
function fixText(t, html) {
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);

  const em = html ? EM_HTML : "\u2014";

  // Apostrophe corruption before generic replacement-char → em dash
  t = t.replace(/We[\uFFFD]re/g, "We're");
  t = t.replace(/Weï¿½re/g, "We're");

  // Replacement character and common mojibake for em dash
  t = t.replace(/\uFFFD/g, em);
  t = t.replace(/ï¿½/g, em);

  // Known em-dash ? patterns (avoid URL query strings)
  const emDashPatterns = [
    [/DuaCrypto \? Albania/g, `DuaCrypto ${em} Albania`],
    [/Web3 \? no borders/g, `Web3 ${em} no borders`],
    [/in Tirana \? Bitcoin/g, `in Tirana ${em} Bitcoin`],
    [/Pizza Day \? DuaCrypto/g, `Pizza Day ${em} DuaCrypto`],
    [/with DuaCrypto \? the/g, `with DuaCrypto ${em} the`],
    [/Conference \? DeFi/g, `Conference ${em} DeFi`],
    [/Albanian media \? ABC/g, `Albanian media ${em} ABC`],
    [/Top Channel \? covering/g, `Top Channel ${em} covering`],
    [/screenshots \? show/g, `screenshots ${em} show`],
    [/Dkane \? DuaCrypto/g, `Dkane ${em} DuaCrypto`],
    [/on DuaCrypto \? return/g, `on DuaCrypto ${em} return`],
    [/Shqip\?ria/g, html ? "Shqip&euml;ria" : "Shqipëria"],
    [/ \? Free guides/g, ` ${em} Free guides`],
    [/ \? Our store/g, ` ${em} Our store`],
    [/ \? Explore the story/g, ` ${em} Explore the story`],
    [/Get Discount \?/g, html ? `Get Discount ${ARROW_INLINE_HTML}` : "Get Discount →"],
    [/Sign Up Bonus \?/g, html ? `Sign Up Bonus ${ARROW_INLINE_HTML}` : "Sign Up Bonus →"],
    [/Get Started \?/g, html ? `Get Started ${ARROW_INLINE_HTML}` : "Get Started →"],
  ];
  for (const [re, rep] of emDashPatterns) t = t.replace(re, rep);

  if (html) {
    // Homepage / about check-row bullets (was ?? emoji)
    t = t.replace(
      /<p>\?\? <strong><a href="https:\/\/duacrypto\.org/g,
      `<p>${ARROW_HTML} <strong><a href="https://duacrypto.org`,
    );
    t = t.replace(
      /<p>\?\? <strong><a href="https:\/\/duabtc\.com/g,
      `<p>${ARROW_HTML} <strong><a href="https://duabtc.com`,
    );
    t = t.replace(
      /<p>\?\? <strong><a href="https:\/\/bitcoinzat\.com/g,
      `<p>${ARROW_HTML} <strong><a href="https://bitcoinzat.com`,
    );

    // about.html profile card
    t = t.replace(
      /<button type="button" class="share-btn" onclick="document\.getElementById\('upload-input'\)\.click\(\)">\?\? Share<\/button>/g,
      `<button type="button" class="share-btn" onclick="document.getElementById('upload-input').click()"><i class="fas fa-share me-1" aria-hidden="true"></i> Share</button>`,
    );
    t = t.replace(
      /<span class="icon" aria-hidden="true">\?<\/span>\s*\n\s*<span class="icon" aria-hidden="true">\?\?<\/span>/g,
      `<span class="icon" aria-hidden="true"><i class="fas fa-bolt"></i></span>\n                                <span class="icon" aria-hidden="true"><i class="fab fa-x-twitter"></i></span>`,
    );
  } else {
    t = t.replace(/^\?\? /gm, "→ ");
    t = t.replace(/\?\? Share/g, "Share");
    t = t.replace(/(<span class="icon"[^>]*>)\?\?/g, "$1"); // strip broken icon placeholders in md exports
    t = t.replace(/^\s*\?\?\s*$/gm, "");
    t = t.replace(/^\s*\?\s*$/gm, "");
    t = t.replace(/ \? Free guides/g, ` ${em} Free guides`);
    t = t.replace(/ \? Our store/g, ` ${em} Our store`);
    t = t.replace(/ \? Explore the story/g, ` ${em} Explore the story`);
  }

  return t;
}

const files = walk(ROOT);
const changed = [];

for (const file of files) {
  const raw = fs.readFileSync(file);
  let text = raw.toString("utf8");
  const html = file.endsWith(".html");
  const next = fixText(text, html);
  if (next !== text) {
    fs.writeFileSync(file, next, { encoding: "utf8" });
    changed.push(path.relative(ROOT, file));
  }
}

console.log("Fixed", changed.length, "files:");
for (const f of changed.sort()) console.log(" ", f);
