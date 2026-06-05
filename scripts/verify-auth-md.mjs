#!/usr/bin/env node
/**
 * Verify auth.md agent registration discovery assets.
 *
 * Usage:
 *   npm run verify:auth-md
 *   npm run verify:auth-md -- https://www.duacrypto.com
 */
import {
  AGENT_AUTH,
  PROTECTED_RESOURCE_METADATA,
  SITE_ORIGIN,
} from "../lib/auth-md-config.mjs";

const base = (process.argv[2] ?? SITE_ORIGIN).replace(/\/$/, "");

const requiredAgentAuthFields = [
  "skill",
  "register_uri",
  "claim_uri",
  "revocation_uri",
  "identity_types_supported",
  "anonymous",
  "identity_assertion",
  "events_supported",
];

let failed = 0;

function fail(msg) {
  console.log(`[FAIL] ${msg}`);
  failed++;
}

function ok(msg) {
  console.log(`[OK] ${msg}`);
}

console.log(`auth.md verification for ${base}\n`);

// auth.md
try {
  const res = await fetch(`${base}/auth.md`);
  const text = await res.text();
  if (!res.ok) {
    fail(`/auth.md HTTP ${res.status}`);
  } else if (!/^#\s*auth\.md/m.test(text)) {
    fail("/auth.md missing # auth.md title");
  } else if (!text.includes("agent_auth")) {
    fail("/auth.md missing agent_auth documentation");
  } else if (!text.includes(AGENT_AUTH.register_uri)) {
    fail("/auth.md missing register_uri");
  } else {
    ok(`/auth.md (${text.length} bytes)`);
  }
} catch (err) {
  fail(`/auth.md — ${err.message}`);
}

// PRM
try {
  const res = await fetch(`${base}/.well-known/oauth-protected-resource`);
  const prm = await res.json();
  if (!res.ok) fail(`oauth-protected-resource HTTP ${res.status}`);
  else if (prm.resource !== PROTECTED_RESOURCE_METADATA.resource) {
    fail(`PRM resource mismatch: ${prm.resource}`);
  } else if (!Array.isArray(prm.authorization_servers) || !prm.authorization_servers.length) {
    fail("PRM missing authorization_servers");
  } else {
    ok("oauth-protected-resource");
  }
} catch (err) {
  fail(`oauth-protected-resource — ${err.message}`);
}

// AS metadata + agent_auth
try {
  const res = await fetch(`${base}/.well-known/oauth-authorization-server`);
  const as = await res.json();
  if (!res.ok) fail(`oauth-authorization-server HTTP ${res.status}`);
  else if (!as.agent_auth) fail("oauth-authorization-server missing agent_auth block");
  else {
    for (const field of requiredAgentAuthFields) {
      if (as.agent_auth[field] == null) {
        fail(`agent_auth missing ${field}`);
      }
    }
    if (
      as.agent_auth.skill !== AGENT_AUTH.skill ||
      as.agent_auth.register_uri !== AGENT_AUTH.register_uri
    ) {
      fail("agent_auth URIs do not match lib/auth-md-config.mjs");
    } else {
      ok(`oauth-authorization-server agent_auth (${as.agent_auth.identity_types_supported.join(", ")})`);
    }
  }
} catch (err) {
  fail(`oauth-authorization-server — ${err.message}`);
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll auth.md checks passed.");
process.exit(failed ? 1 : 0);
