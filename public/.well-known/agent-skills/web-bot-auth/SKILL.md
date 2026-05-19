---
description: Publish and use Web Bot Auth HTTP message signatures for DuaCrypto agents.
---

# Web Bot Auth (DuaCrypto)

This site publishes a Web Bot Auth key directory so automated agents can verify signed requests from DuaCrypto.

## Key directory

- URL: `https://duacrypto.com/.well-known/http-message-signatures-directory`
- Content-Type: `application/http-message-signatures-directory+json`
- Algorithm: Ed25519 (`OKP` / `Ed25519`)

## Signing outbound bot requests

When this site (or its agents) call other origins, include:

- `Signature-Agent`: `"https://duacrypto.com/.well-known/http-message-signatures-directory"`
- `Signature-Input` with `tag="web-bot-auth"`
- `Signature`

Use the private key stored in deployment secrets (`WEB_BOT_AUTH_PRIVATE_JWK`). See [Cloudflare Web Bot Auth](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/) and the [IETF WebBotAuth WG](https://datatracker.ietf.org/wg/webbotauth/about/).

## Validate

```http
POST https://isitagentready.com/api/scan
Content-Type: application/json

{"url": "https://duacrypto.com"}
```

Expect `checks.botAccessControl.webBotAuth.status` to be `"pass"`.
