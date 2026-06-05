# auth.md

You are an agent. **DuaCrypto** supports agentic registration for the public Site API: discover → register → (claim if needed) → call the API → handle revocation. Follow the steps in order.

- **Resource server (API):** `https://duacrypto.com/api/v1/site`
- **Authorization server:** `https://duacrypto.com`

Human docs: [API documentation](https://duacrypto.com/docs/api) · Contact: [info@duacrypto.com](mailto:info@duacrypto.com)

## Step 1 — Discover

Fetch Protected Resource Metadata (PRM), then Authorization Server metadata with the `agent_auth` block.

### 1a. Protected Resource Metadata

```http
GET https://duacrypto.com/.well-known/oauth-protected-resource HTTP/1.1
Host: duacrypto.com
Accept: application/json
```

```json
{
  "resource": "https://duacrypto.com/api/v1/site",
  "resource_name": "DuaCrypto Site API",
  "resource_logo_uri": "https://duacrypto.com/img/duacrypto-mark.svg",
  "authorization_servers": [
    "https://duacrypto.com"
  ],
  "scopes_supported": [
    "site.read"
  ],
  "bearer_methods_supported": [
    "header"
  ],
  "resource_documentation": "https://duacrypto.com/docs/api"
}
```

Fields:

- `resource` — canonical API base (`https://duacrypto.com/api/v1/site`).
- `resource_name` / `resource_logo_uri` — display metadata for user consent.
- `authorization_servers` — OAuth AS base URLs; use `authorization_servers[0]` for step 1b.
- `scopes_supported` — `site.read` for public page index and health endpoints.
- `bearer_methods_supported` — send credentials as `Authorization: Bearer …`.

On `401 Unauthorized`, the API may include:

```http
WWW-Authenticate: Bearer resource_metadata="https://duacrypto.com/.well-known/oauth-protected-resource"
```

### 1b. Authorization Server metadata

```http
GET https://duacrypto.com/.well-known/oauth-authorization-server HTTP/1.1
Host: duacrypto.com
Accept: application/json
```

Read the `agent_auth` block in full:

```json
{
  "agent_auth": {
    "skill": "https://duacrypto.com/auth.md",
    "register_uri": "https://duacrypto.com/agent/auth",
    "claim_uri": "https://duacrypto.com/agent/auth/claim",
    "revocation_uri": "https://duacrypto.com/agent/auth/revoke",
    "identity_types_supported": [
      "anonymous",
      "identity_assertion"
    ],
    "anonymous": {
      "credential_types_supported": [
        "api_key"
      ]
    },
    "identity_assertion": {
      "assertion_types_supported": [
        "urn:ietf:params:oauth:token-type:id-jag",
        "verified_email"
      ],
      "credential_types_supported": [
        "access_token",
        "api_key"
      ]
    },
    "events_supported": [
      "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked"
    ]
  }
}
```

- `skill` — this document (`https://duacrypto.com/auth.md`).
- `register_uri` — `POST` agent registration (`https://duacrypto.com/agent/auth`).
- `claim_uri` — OTP claim trigger (`https://duacrypto.com/agent/auth/claim`).
- `revocation_uri` — provider-driven revocation (`https://duacrypto.com/agent/auth/revoke`).
- `identity_types_supported` — `anonymous`, `identity_assertion`.
- `anonymous.credential_types_supported` — `api_key`.
- `identity_assertion.assertion_types_supported` — ID-JAG and verified email.
- `identity_assertion.credential_types_supported` — `access_token`, `api_key`.
- `events_supported` — assertion revocation events.

If this file conflicts with live metadata, **trust the JSON documents**.

## Step 2 — Pick a method

1. **ID-JAG** for audience `https://duacrypto.com/api/v1/site` → `identity_assertion` + `urn:ietf:params:oauth:token-type:id-jag`.
2. **Verified user email only** → `identity_assertion` + `verified_email` (claim required).
3. **No identity** → `anonymous` (optional claim later).

Cross-check `identity_types_supported` and the matching `*_supported` arrays before sending.

## Step 3 — Register

`POST` to `https://duacrypto.com/agent/auth` with `Content-Type: application/json`.

### identity_assertion + id-jag

```http
POST /agent/auth HTTP/1.1
Host: duacrypto.com
Content-Type: application/json
```

```json
{
  "type": "identity_assertion",
  "assertion_type": "urn:ietf:params:oauth:token-type:id-jag",
  "assertion": "<id-jag-jwt>",
  "requested_credential_type": "access_token",
  "requested_scopes": ["site.read"]
}
```

Success:

```json
{
  "registration_id": "reg_…",
  "credential_type": "access_token",
  "credential": "<token>",
  "credential_expires": "2026-12-31T23:59:59.000Z",
  "scopes": ["site.read"]
}
```

### identity_assertion + verified_email

```json
{
  "type": "identity_assertion",
  "assertion_type": "verified_email",
  "email": "user@example.com",
  "requested_scopes": ["site.read"]
}
```

Returns `claim_token` and `post_claim_scopes`; no credential until Step 4c.

### anonymous

```json
{
  "type": "anonymous",
  "requested_credential_type": "api_key",
  "requested_scopes": ["site.read"]
}
```

Returns a pre-claim `api_key` plus optional `claim_token`.

## Step 4 — Claim ceremony

**4a.** Anonymous only — `POST https://duacrypto.com/agent/auth/claim`:

```json
{ "claim_token": "<token>", "email": "user@example.com" }
```

**4b.** Ask the user to read the OTP from email.

**4c.** `POST https://duacrypto.com/agent/auth/claim/complete`:

```json
{ "claim_token": "<token>", "otp": "123456" }
```

## Step 5 — Use the credential

```http
GET /api/v1/site/pages HTTP/1.1
Host: duacrypto.com
Authorization: Bearer <credential>
Accept: application/json
```

Paid routes may return `402 Payment Required` (x402). See [x402 skill](https://duacrypto.com/.well-known/agent-skills/x402/SKILL.md).

## Step 6 — Errors

| Code | Endpoint | Action |
|------|----------|--------|
| `invalid_signature` | register | Reject ID-JAG; retry with email or anonymous |
| `audience_mismatch` | register | Mint ID-JAG for `https://duacrypto.com/api/v1/site` |
| `unsupported_identity_type` | register | Pick a supported type from `agent_auth` |
| `invalid_claim_token` | claim | Restart at Step 3 |
| `otp_invalid` / `otp_expired` | claim/complete | Re-trigger claim or restart |
| `credential_expired` | API | Re-register at Step 3 |

## Step 7 — Revocation

Agents do not call `revocation_uri` directly. Providers POST logout tokens to `https://duacrypto.com/agent/auth/revoke` for ID-JAG flows. On `401`, restart discovery at Step 1.

---

*Machine-readable source of truth: `https://duacrypto.com/.well-known/oauth-protected-resource` and `https://duacrypto.com/.well-known/oauth-authorization-server`.*

