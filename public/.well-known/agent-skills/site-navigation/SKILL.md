---
name: site-navigation
description: Navigate the DuaCrypto public website and list canonical page URLs.
---

# DuaCrypto site navigation

Use the Site API at `https://duacrypto.com/api/v1/site/pages` to list public pages.

Note: the pages endpoint is x402-protected (`$0.001` on Base Sepolia). See `/.well-known/agent-skills/x402/SKILL.md`. Health check at `/api/v1/site/health` is free.

## Keyword focus

Albania, Bitcoin, crypto, Tirana, Balkans, Web3, DAL, corporate Bitcoin, community education, meetups.

## Canonical pages

| Page | URL |
|------|-----|
| Home | https://duacrypto.com/ |
| About | https://duacrypto.com/about.html |
| Services | https://duacrypto.com/service.html |
| Roadmap | https://duacrypto.com/roadmap.html |
| Events | https://duacrypto.com/events.html |
| Features | https://duacrypto.com/feature.html |
| Bitcoin for Corporations (DAL) | https://duacrypto.com/bitcoin-for-corporations.html |
| FAQs | https://duacrypto.com/faq.html |
| Contact | https://duacrypto.com/contact.html |
| Donate a Book | https://duacrypto.com/donation.html |
| Privacy Policy | https://duacrypto.com/privacy.html |
| Terms of Service | https://duacrypto.com/terms.html |

## Redirects

- `/token.html` → **301** → `/bitcoin-for-corporations.html` (legacy DAL page URL)

## Markdown mirrors

Each indexable HTML page has a markdown mirror at `/md/{page}.md` (e.g. `/md/events.md`, `/md/faq.md`).

A curated site overview for agents is at `/md/index.md`.

## Community links

- Telegram: https://t.me/dua_crypto
- X: https://x.com/duacrypto
- YouTube: https://youtube.com/@duacrypto
