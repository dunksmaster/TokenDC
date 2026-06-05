import { AGENT_AUTH, WWW_AUTHENTICATE_BEARER } from "../../lib/auth-md-config.mjs";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function notImplemented(route: string): Response {
  return new Response(
    JSON.stringify({
      error: "not_implemented",
      message:
        "Agent registration endpoints are advertised for discovery; full registration flows are rolling out. Contact info@duacrypto.com for integration access.",
      documentation: AGENT_AUTH.skill,
      route,
    }),
    { status: 501, headers: JSON_HEADERS }
  );
}

function methodNotAllowed(): Response {
  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: {
      ...JSON_HEADERS,
      Allow: "POST",
    },
  });
}

export const onRequest: PagesFunction = async ({ request, params }) => {
  const segments = (params.path as string[] | undefined) ?? [];
  const route = `/agent/${segments.join("/")}`.replace(/\/$/, "") || "/agent";

  if (request.method !== "POST") {
    return methodNotAllowed();
  }

  if (route === "/agent/auth") {
    return notImplemented(route);
  }
  if (route === "/agent/auth/claim") {
    return notImplemented(route);
  }
  if (route === "/agent/auth/claim/complete") {
    return notImplemented(route);
  }
  if (route === "/agent/auth/revoke") {
    return notImplemented(route);
  }

  return new Response(JSON.stringify({ error: "not_found" }), {
    status: 404,
    headers: {
      ...JSON_HEADERS,
      "WWW-Authenticate": WWW_AUTHENTICATE_BEARER,
    },
  });
};
