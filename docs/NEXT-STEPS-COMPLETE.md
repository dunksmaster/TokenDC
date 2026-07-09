# Next steps checklist — completion notes (2026-07-09)

| Case | Status | Notes |
|------|--------|-------|
| 1 Domain | Done | CNAME `news.duacrypto.com` created; HTTPS 200 |
| 2 Smoke | Done | `npm run smoke` in duacrypto-news — all checks pass |
| 3 AI cron | Blocked on secret | Add `ANTHROPIC_API_KEY` to duacrypto-news; see `docs/SETUP-AI.md` |
| 4 Interactive publish | Done | Welcome post + Albanian twin published |
| 5 LCP/CLS ship | Done | Deployed; PSI LCP 7.3s home / 6.4s events |
| 6 GSC | Preflight done | Operator: submit sitemaps in GSC UI — `docs/GSC-NEXT-STEPS.md` |
| 7 GA | Done | `gtag-deferred.js` on news site |
| 8 SEO | Done | OG tags, robots, sitemap live on news domain |
| 9 Newsletter RSS | Done | Newsletter page links to news + RSS |
| 10 Telegram | Done | Workflow added; set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` to activate |
| 11 Deferred | Done (audit) | CSP enforce in CI, x402 + hreflang audit scripts/docs |
| 12 Search + sq | Done | Pagefind search + Albanian welcome post with hreflang |
