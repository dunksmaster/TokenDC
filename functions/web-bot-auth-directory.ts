import { directoryResponseHeaders } from "web-bot-auth";
import { signerFromJWK } from "web-bot-auth/crypto";

const DIRECTORY_PATH = "/.well-known/http-message-signatures-directory";
const CONTENT_TYPE = "application/http-message-signatures-directory+json";
/** Signature validity window; Cache-Control must not exceed this. */
const SIGNATURE_TTL_MS = 60_000;
const SIGNATURE_TTL_SEC = SIGNATURE_TTL_MS / 1000;

export function isWebBotAuthDirectory(pathname: string): boolean {
  return pathname === DIRECTORY_PATH;
}

export async function signedDirectoryResponse(
  request: Request,
  jwksBody: string,
  privateJwkJson: string
): Promise<Response> {
  const privateJwk = JSON.parse(privateJwkJson) as JsonWebKey;
  const signer = await signerFromJWK(privateJwk);
  const now = new Date();
  const expires = new Date(now.getTime() + SIGNATURE_TTL_MS);

  const headers = new Headers({
    "Content-Type": CONTENT_TYPE,
    "Cache-Control": `public, max-age=${SIGNATURE_TTL_SEC}, must-revalidate`,
  });

  const unsigned = new Response(jwksBody, { status: 200, headers });

  const sigHeaders = await directoryResponseHeaders(
    { request, response: unsigned },
    [signer],
    { created: now, expires }
  );

  const signed = new Headers(unsigned.headers);
  signed.set("Signature", sigHeaders.Signature);
  signed.set("Signature-Input", sigHeaders["Signature-Input"]);
  // Ensure directory headers survive the final Response (required for validators/caches).
  signed.set("Content-Type", CONTENT_TYPE);
  signed.set(
    "Cache-Control",
    `public, max-age=${SIGNATURE_TTL_SEC}, must-revalidate`
  );

  return new Response(jwksBody, {
    status: unsigned.status,
    statusText: unsigned.statusText,
    headers: signed,
  });
}
