---
description: AI crawler User-agent rules in robots.txt per RFC 9309 and Content-Signal policy.
---

# AI Bot Rules (DuaCrypto)

DuaCrypto publishes explicit `User-agent` blocks for AI crawlers in [robots.txt](https://duacrypto.com/robots.txt).

## Policy

- **Allowed for search & AI input:** `GPTBot`, `OAI-SearchBot`, `Claude-Web`, `Google-Extended`, `Amazonbot`, `anthropic-ai`, `Applebot-Extended`, `PerplexityBot`
- **Blocked:** `Bytespider`, `CCBot` (`Disallow: /`)
- **Content-Signal:** `ai-train=no, search=yes, ai-input=yes` on allowed agents

Regenerate on build: `npm run agent:generate`

## Validate

```http
POST https://isitagentready.com/api/scan
Content-Type: application/json

{"url": "https://duacrypto.com"}
```

Expect `checks.botAccessControl.robotsTxtAiRules.status` to be `"pass"`.
