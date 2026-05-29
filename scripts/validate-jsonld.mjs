import { readFileSync } from "node:fs";

const files = ["index.html", "faq.html", "events.html", "privacy.html", "terms.html", "about.html"];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  blocks.forEach((block, i) => {
    JSON.parse(block[1]);
  });
  console.log(`${file}: ${blocks.length} JSON-LD block(s) valid`);
}
