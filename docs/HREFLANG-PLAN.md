# hreflang / Albanian (`/sq/`) — follow-up

TokenDC main site does not yet ship `/sq/` HTML mirrors. Recommended approach:

1. Mirror high-traffic pages under `sq/` with Albanian copy
2. Add `<link rel="alternate" hreflang="sq" href="...">` + `hreflang="en"` pairs in `dc-seo` blocks
3. Extend sitemap with `xhtml:link` alternates

News site: Albanian posts use `lang: sq` + `translationOf` in frontmatter; hreflang tags emitted on post pages.

Run `npm run audit:hreflang` after first `/sq/` pages land.
