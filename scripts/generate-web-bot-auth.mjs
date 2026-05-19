/**
 * Generate Ed25519 keys and publish Web Bot Auth JWKS at
 * /.well-known/http-message-signatures-directory (and OAuth jwks.json).
 *
 * Private key: secrets/web-bot-auth-private.jwk (gitignored) or WEB_BOT_AUTH_PRIVATE_JWK env.
 */
import { createHash, generateKeyPairSync } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const secretsDir = join(root, "secrets");
const privatePath = join(secretsDir, "web-bot-auth-private.jwk");
const directoryPath = join(
  root,
  "public",
  ".well-known",
  "http-message-signatures-directory"
);
const jwksPath = join(root, "public", ".well-known", "jwks.json");
const keyMetaPath = join(root, "public", ".well-known", "web-bot-auth.json");

function jwkThumbprint(publicJwk) {
  const canonical = JSON.stringify({
    crv: publicJwk.crv,
    kty: publicJwk.kty,
    x: publicJwk.x,
  });
  return createHash("sha256").update(canonical).digest("base64url");
}

function publicJwk(privateJwk) {
  return {
    kty: privateJwk.kty,
    crv: privateJwk.crv,
    x: privateJwk.x,
  };
}

function loadPrivateJwk() {
  const fromEnv = process.env.WEB_BOT_AUTH_PRIVATE_JWK;
  if (fromEnv) {
    return JSON.parse(fromEnv);
  }
  if (existsSync(privatePath)) {
    return JSON.parse(readFileSync(privatePath, "utf8"));
  }
  return null;
}

function createPrivateJwk() {
  const { privateKey } = generateKeyPairSync("ed25519");
  return privateKey.export({ format: "jwk" });
}

export function generateWebBotAuth() {
  let privateJwk = loadPrivateJwk();
  let created = false;

  if (!privateJwk) {
    if (existsSync(directoryPath)) {
      console.log(
        "Web Bot Auth: using committed JWKS (set secrets/web-bot-auth-private.jwk to regenerate)."
      );
      return { created: false, kid: null };
    }
    privateJwk = createPrivateJwk();
    mkdirSync(secretsDir, { recursive: true });
    writeFileSync(privatePath, JSON.stringify(privateJwk, null, 2), "utf8");
    created = true;
    console.log(
      "Web Bot Auth: created new Ed25519 key in secrets/web-bot-auth-private.jwk"
    );
    console.log(
      "  Set Cloudflare Pages secret WEB_BOT_AUTH_PRIVATE_JWK for signed directory responses."
    );
  }

  const pub = publicJwk(privateJwk);
  const kid = jwkThumbprint(pub);

  const directoryJwks = {
    keys: [{ kty: pub.kty, crv: pub.crv, x: pub.x }],
  };

  const oauthJwks = {
    keys: [
      {
        ...pub,
        kid,
        use: "sig",
        alg: "EdDSA",
      },
    ],
  };

  const meta = {
    signature_agent: "https://duacrypto.com/.well-known/http-message-signatures-directory",
    keyid: kid,
    algorithm: "ed25519",
    directory_content_type: "application/http-message-signatures-directory+json",
  };

  mkdirSync(dirname(directoryPath), { recursive: true });
  writeFileSync(
    directoryPath,
    `${JSON.stringify(directoryJwks, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(jwksPath, `${JSON.stringify(oauthJwks, null, 2)}\n`, "utf8");
  writeFileSync(keyMetaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  return { created, kid };
}
