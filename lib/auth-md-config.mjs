/**
 * auth.md / RFC 9728 agent registration discovery — single source of truth.
 * @see https://workos.com/auth-md
 */

export const SITE_ORIGIN = "https://duacrypto.com";
export const RESOURCE_URL = `${SITE_ORIGIN}/api/v1/site`;
export const AUTH_SERVER = SITE_ORIGIN;

export const SCOPES = ["site.read"];

export const AGENT_AUTH = {
  skill: `${SITE_ORIGIN}/auth.md`,
  register_uri: `${SITE_ORIGIN}/agent/auth`,
  claim_uri: `${SITE_ORIGIN}/agent/auth/claim`,
  revocation_uri: `${SITE_ORIGIN}/agent/auth/revoke`,
  identity_types_supported: ["anonymous", "identity_assertion"],
  anonymous: {
    credential_types_supported: ["api_key"],
  },
  identity_assertion: {
    assertion_types_supported: [
      "urn:ietf:params:oauth:token-type:id-jag",
      "verified_email",
    ],
    credential_types_supported: ["access_token", "api_key"],
  },
  events_supported: [
    "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
  ],
};

export const PROTECTED_RESOURCE_METADATA = {
  resource: RESOURCE_URL,
  resource_name: "DuaCrypto Site API",
  resource_logo_uri: `${SITE_ORIGIN}/img/duacrypto-mark.svg`,
  authorization_servers: [AUTH_SERVER],
  scopes_supported: SCOPES,
  bearer_methods_supported: ["header"],
  resource_documentation: `${SITE_ORIGIN}/docs/api`,
};

export const OAUTH_AUTHORIZATION_SERVER = {
  issuer: AUTH_SERVER,
  authorization_endpoint: `${AUTH_SERVER}/oauth/authorize`,
  token_endpoint: `${AUTH_SERVER}/oauth/token`,
  jwks_uri: `${AUTH_SERVER}/.well-known/jwks.json`,
  registration_endpoint: `${AUTH_SERVER}/oauth/register`,
  revocation_endpoint: AGENT_AUTH.revocation_uri,
  scopes_supported: ["openid", ...SCOPES],
  response_types_supported: ["code"],
  grant_types_supported: [
    "authorization_code",
    "client_credentials",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
  ],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
  token_endpoint_auth_methods_supported: ["client_secret_basic", "none"],
  service_documentation: `${SITE_ORIGIN}/docs/api`,
  agent_auth: AGENT_AUTH,
};

export const OPENID_CONFIGURATION = {
  issuer: OAUTH_AUTHORIZATION_SERVER.issuer,
  authorization_endpoint: OAUTH_AUTHORIZATION_SERVER.authorization_endpoint,
  token_endpoint: OAUTH_AUTHORIZATION_SERVER.token_endpoint,
  jwks_uri: OAUTH_AUTHORIZATION_SERVER.jwks_uri,
  registration_endpoint: OAUTH_AUTHORIZATION_SERVER.registration_endpoint,
  revocation_endpoint: OAUTH_AUTHORIZATION_SERVER.revocation_endpoint,
  scopes_supported: OAUTH_AUTHORIZATION_SERVER.scopes_supported,
  response_types_supported: OAUTH_AUTHORIZATION_SERVER.response_types_supported,
  grant_types_supported: OAUTH_AUTHORIZATION_SERVER.grant_types_supported,
  subject_types_supported: OAUTH_AUTHORIZATION_SERVER.subject_types_supported,
  id_token_signing_alg_values_supported:
    OAUTH_AUTHORIZATION_SERVER.id_token_signing_alg_values_supported,
  token_endpoint_auth_methods_supported:
    OAUTH_AUTHORIZATION_SERVER.token_endpoint_auth_methods_supported,
};

export const PRM_WELL_KNOWN_URL = `${SITE_ORIGIN}/.well-known/oauth-protected-resource`;

/** RFC 9728 discovery hint for 401 responses. */
export const WWW_AUTHENTICATE_BEARER = `Bearer resource_metadata="${PRM_WELL_KNOWN_URL}"`;

/** Prose companion for agents (auth.md protocol). */
export function generateAuthMd() {
  const s = SITE_ORIGIN;
  const resource = RESOURCE_URL;
  const auth = AUTH_SERVER;
  const prm = `${s}/.well-known/oauth-protected-resource`;
  const asMeta = `${auth}/.well-known/oauth-authorization-server`;

  return `# auth.md

You are an agent. **DuaCrypto** supports agentic registration for the public Site API: discover → register → (claim if needed) → call the API → handle revocation. Follow the steps in order.

- **Resource server (API):** \`${resource}\`
- **Authorization server:** \`${auth}\`

Human docs: [API documentation](${s}/docs/api) · Contact: [info@duacrypto.com](mailto:info@duacrypto.com)

## Step 1 — Discover

Fetch Protected Resource Metadata (PRM), then Authorization Server metadata with the \`agent_auth\` block.

### 1a. Protected Resource Metadata

\`\`\`http
GET ${prm} HTTP/1.1
Host: duacrypto.com
Accept: application/json
\`\`\`

\`\`\`json
${JSON.stringify(PROTECTED_RESOURCE_METADATA, null, 2)}
\`\`\`

Fields:

- \`resource\` — canonical API base (\`${resource}\`).
- \`resource_name\` / \`resource_logo_uri\` — display metadata for user consent.
- \`authorization_servers\` — OAuth AS base URLs; use \`authorization_servers[0]\` for step 1b.
- \`scopes_supported\` — \`site.read\` for public page index and health endpoints.
- \`bearer_methods_supported\` — send credentials as \`Authorization: Bearer …\`.

On \`401 Unauthorized\`, the API may include:

\`\`\`http
WWW-Authenticate: ${WWW_AUTHENTICATE_BEARER}
\`\`\`

### 1b. Authorization Server metadata

\`\`\`http
GET ${asMeta} HTTP/1.1
Host: duacrypto.com
Accept: application/json
\`\`\`

Read the \`agent_auth\` block in full:

\`\`\`json
${JSON.stringify({ agent_auth: AGENT_AUTH }, null, 2)}
\`\`\`

- \`skill\` — this document (\`${AGENT_AUTH.skill}\`).
- \`register_uri\` — \`POST\` agent registration (\`${AGENT_AUTH.register_uri}\`).
- \`claim_uri\` — OTP claim trigger (\`${AGENT_AUTH.claim_uri}\`).
- \`revocation_uri\` — provider-driven revocation (\`${AGENT_AUTH.revocation_uri}\`).
- \`identity_types_supported\` — \`anonymous\`, \`identity_assertion\`.
- \`anonymous.credential_types_supported\` — \`api_key\`.
- \`identity_assertion.assertion_types_supported\` — ID-JAG and verified email.
- \`identity_assertion.credential_types_supported\` — \`access_token\`, \`api_key\`.
- \`events_supported\` — assertion revocation events.

If this file conflicts with live metadata, **trust the JSON documents**.

## Step 2 — Pick a method

1. **ID-JAG** for audience \`${resource}\` → \`identity_assertion\` + \`urn:ietf:params:oauth:token-type:id-jag\`.
2. **Verified user email only** → \`identity_assertion\` + \`verified_email\` (claim required).
3. **No identity** → \`anonymous\` (optional claim later).

Cross-check \`identity_types_supported\` and the matching \`*_supported\` arrays before sending.

## Step 3 — Register

\`POST\` to \`${AGENT_AUTH.register_uri}\` with \`Content-Type: application/json\`.

### identity_assertion + id-jag

\`\`\`http
POST /agent/auth HTTP/1.1
Host: duacrypto.com
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "type": "identity_assertion",
  "assertion_type": "urn:ietf:params:oauth:token-type:id-jag",
  "assertion": "<id-jag-jwt>",
  "requested_credential_type": "access_token",
  "requested_scopes": ["site.read"]
}
\`\`\`

Success:

\`\`\`json
{
  "registration_id": "reg_…",
  "credential_type": "access_token",
  "credential": "<token>",
  "credential_expires": "2026-12-31T23:59:59.000Z",
  "scopes": ["site.read"]
}
\`\`\`

### identity_assertion + verified_email

\`\`\`json
{
  "type": "identity_assertion",
  "assertion_type": "verified_email",
  "email": "user@example.com",
  "requested_scopes": ["site.read"]
}
\`\`\`

Returns \`claim_token\` and \`post_claim_scopes\`; no credential until Step 4c.

### anonymous

\`\`\`json
{
  "type": "anonymous",
  "requested_credential_type": "api_key",
  "requested_scopes": ["site.read"]
}
\`\`\`

Returns a pre-claim \`api_key\` plus optional \`claim_token\`.

## Step 4 — Claim ceremony

**4a.** Anonymous only — \`POST ${AGENT_AUTH.claim_uri}\`:

\`\`\`json
{ "claim_token": "<token>", "email": "user@example.com" }
\`\`\`

**4b.** Ask the user to read the OTP from email.

**4c.** \`POST ${AGENT_AUTH.claim_uri}/complete\`:

\`\`\`json
{ "claim_token": "<token>", "otp": "123456" }
\`\`\`

## Step 5 — Use the credential

\`\`\`http
GET /api/v1/site/pages HTTP/1.1
Host: duacrypto.com
Authorization: Bearer <credential>
Accept: application/json
\`\`\`

Paid routes may return \`402 Payment Required\` (x402). See [x402 skill](${s}/.well-known/agent-skills/x402/SKILL.md).

## Step 6 — Errors

| Code | Endpoint | Action |
|------|----------|--------|
| \`invalid_signature\` | register | Reject ID-JAG; retry with email or anonymous |
| \`audience_mismatch\` | register | Mint ID-JAG for \`${resource}\` |
| \`unsupported_identity_type\` | register | Pick a supported type from \`agent_auth\` |
| \`invalid_claim_token\` | claim | Restart at Step 3 |
| \`otp_invalid\` / \`otp_expired\` | claim/complete | Re-trigger claim or restart |
| \`credential_expired\` | API | Re-register at Step 3 |

## Step 7 — Revocation

Agents do not call \`revocation_uri\` directly. Providers POST logout tokens to \`${AGENT_AUTH.revocation_uri}\` for ID-JAG flows. On \`401\`, restart discovery at Step 1.

---

*Machine-readable source of truth: \`${prm}\` and \`${asMeta}\`.*
`;
}
