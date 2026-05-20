---
name: x402
description: Pay for DuaCrypto Site API access using the x402 HTTP payment protocol.
---

# x402 payments on DuaCrypto

DuaCrypto supports [x402](https://x402.org/) agent-native HTTP payments on protected API routes.

## Free endpoints

- `GET https://duacrypto.com/api/v1/site/health` — service health (no payment)

## Paid endpoints

- `GET https://duacrypto.com/api/v1/site/pages` — full page index for agents

Without payment, this route returns **HTTP 402 Payment Required** with machine-readable payment instructions.

## Payment flow

1. Request `GET /api/v1/site/pages`.
2. Read the `402` response payment requirements.
3. Pay through the facilitator (`https://x402.org/facilitator`) on **Base Sepolia** (`eip155:84532`).
4. Retry the request with the x402 payment header.
5. Receive the JSON page index on success.

## Discovery

- `/.well-known/x402` — payable resource list
- `/openapi/site-api.yaml` — OpenAPI with payment metadata
- `/docs/api` — human-readable API docs

## Configuration

| Setting | Value |
|---------|-------|
| Facilitator | `https://x402.org/facilitator` |
| Network | `eip155:84532` (Base Sepolia) |
| Price | `$0.001` per request |
| Pay to | `0x26507ccEEaB8C073620205Bf4aE1cd50E9f612af` |
