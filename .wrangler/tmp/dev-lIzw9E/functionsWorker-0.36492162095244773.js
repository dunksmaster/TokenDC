var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-Rld8Tl/checked-fetch.js
var state = globalThis.__WRANGLER_CHECKED_FETCH__ ?? {
  urls: /* @__PURE__ */ new Set(),
  wrapped: false
};
globalThis.__WRANGLER_CHECKED_FETCH__ = state;
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!state.urls.has(url.toString())) {
      state.urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
if (!state.wrapped) {
  state.wrapped = true;
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = new Proxy(nativeFetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });
}

// .wrangler/tmp/pages-OKa5oP/functionsWorker-0.36492162095244773.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!state2.urls.has(url.toString())) {
      state2.urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
var state2;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-jCrf7s/checked-fetch.js"() {
    state2 = globalThis.__WRANGLER_CHECKED_FETCH__ ?? {
      urls: /* @__PURE__ */ new Set(),
      wrapped: false
    };
    globalThis.__WRANGLER_CHECKED_FETCH__ = state2;
    __name2(checkURL2, "checkURL");
    if (!state2.wrapped) {
      state2.wrapped = true;
      const nativeFetch = globalThis.fetch;
      globalThis.fetch = new Proxy(nativeFetch, {
        apply(target, thisArg, argArray) {
          const [request, init] = argArray;
          checkURL2(request, init);
          return Reflect.apply(target, thisArg, argArray);
        }
      });
    }
  }
});
function wantsMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const parts = acceptHeader.split(",").map((p) => p.trim());
  let markdownQ = -1;
  let htmlQ = -1;
  for (const part of parts) {
    const segments = part.split(";").map((s) => s.trim());
    const mime = segments[0].toLowerCase();
    const qParam = segments.find((s) => s.startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    if (Number.isNaN(q) || q <= 0) continue;
    if (mime === "text/markdown" || mime === "text/x-markdown") {
      markdownQ = Math.max(markdownQ, q);
    }
    if (mime === "text/html" || mime === "*/*") {
      htmlQ = Math.max(htmlQ, q);
    }
  }
  if (markdownQ < 0) return false;
  if (htmlQ < 0) return true;
  return markdownQ >= htmlQ;
}
__name(wantsMarkdown, "wantsMarkdown");
function resolveMarkdownAssetPath(pathname) {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  if (path === "/" || path === "") return "/md/index.md";
  if (path === "/index.html") return "/md/index.md";
  if (path.endsWith(".html")) {
    const base = path.slice(1).replace(/\.html$/, ".md");
    return `/md/${base}`;
  }
  return null;
}
__name(resolveMarkdownAssetPath, "resolveMarkdownAssetPath");
function estimateMarkdownTokens(text) {
  return String(Math.ceil(text.length / 4));
}
__name(estimateMarkdownTokens, "estimateMarkdownTokens");
function isHomepagePath(pathname) {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return path === "/" || path === "/index.html";
}
__name(isHomepagePath, "isHomepagePath");
var init_markdown_negotiation = __esm({
  "../lib/markdown-negotiation.mjs"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    __name2(wantsMarkdown, "wantsMarkdown");
    __name2(resolveMarkdownAssetPath, "resolveMarkdownAssetPath");
    __name2(estimateMarkdownTokens, "estimateMarkdownTokens");
    __name2(isHomepagePath, "isHomepagePath");
  }
});
var jwkThumbprintPreCompute;
var jwkThumbprint;
var init_dist = __esm({
  "../node_modules/jsonwebkey-thumbprint/dist/index.mjs"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    jwkThumbprintPreCompute = /* @__PURE__ */ __name2((jwk) => {
      const encoder = new TextEncoder();
      switch (jwk.kty) {
        // Defined in Section 3.2 of RFC 7638
        case "EC":
          return encoder.encode(
            `{"crv":"${jwk.crv}","kty":"EC","x":"${jwk.x}","y":"${jwk.y}"}`
          );
        // Defined in Appendix A.3 of RFC 8037
        case "OKP":
          return encoder.encode(`{"crv":"${jwk.crv}","kty":"OKP","x":"${jwk.x}"}`);
        // Defined in Section 3.2 of RFC 7638
        case "RSA":
          return encoder.encode(`{"e":"${jwk.e}","kty":"RSA","n":"${jwk.n}"}`);
        default:
          throw new Error("Unsupported key type");
      }
    }, "jwkThumbprintPreCompute");
    jwkThumbprint = /* @__PURE__ */ __name2(async (jwk, hash, decode2) => {
      const precomputed = jwkThumbprintPreCompute(jwk);
      const hashValue = await hash(precomputed);
      return decode2(hashValue);
    }, "jwkThumbprint");
  }
});
function u8ToB64(u) {
  return btoa(String.fromCharCode(...u));
}
__name(u8ToB64, "u8ToB64");
function b64ToB64URL(b) {
  return b.replace(/\+/g, "-").replace(/\//g, "_");
}
__name(b64ToB64URL, "b64ToB64URL");
function b64ToB64NoPadding(b) {
  return b.replace(/=/g, "");
}
__name(b64ToB64NoPadding, "b64ToB64NoPadding");
function signerFromJWK(jwk) {
  switch (jwk.kty) {
    case "OKP":
      if (jwk.crv === "Ed25519") {
        return Ed25519Signer.fromJWK(jwk);
      }
      throw new Error(`Unsupported curve: ${jwk.crv}`);
    case "RSA":
      if (jwk.alg === "PS512") {
        return RSAPSSSHA512Signer.fromJWK(jwk);
      }
      throw new Error(`Unsupported algorithm: ${jwk.alg}`);
    default:
      throw new Error(`Unsupported key type: ${jwk.kty}`);
  }
}
__name(signerFromJWK, "signerFromJWK");
var helpers;
var Ed25519Signer;
var RSAPSSSHA512Signer;
var init_chunk_VXDWK3MV = __esm({
  "../node_modules/web-bot-auth/dist/chunk-VXDWK3MV.mjs"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_dist();
    __name2(u8ToB64, "u8ToB64");
    __name2(b64ToB64URL, "b64ToB64URL");
    __name2(b64ToB64NoPadding, "b64ToB64NoPadding");
    helpers = {
      WEBCRYPTO_SHA256: /* @__PURE__ */ __name2((b) => crypto.subtle.digest("SHA-256", b), "WEBCRYPTO_SHA256"),
      BASE64URL_DECODE: /* @__PURE__ */ __name2((u) => b64ToB64URL(b64ToB64NoPadding(u8ToB64(new Uint8Array(u)))), "BASE64URL_DECODE")
    };
    Ed25519Signer = class _Ed25519Signer {
      static {
        __name(this, "_Ed25519Signer");
      }
      static {
        __name2(this, "_Ed25519Signer");
      }
      constructor(keyid, privateKey) {
        this.alg = "ed25519";
        this.keyid = keyid;
        this.privateKey = privateKey;
      }
      static async fromJWK(jwk) {
        const key = await crypto.subtle.importKey(
          "jwk",
          jwk,
          { name: "Ed25519" },
          true,
          ["sign"]
        );
        const keyid = await jwkThumbprint(
          jwk,
          helpers.WEBCRYPTO_SHA256,
          helpers.BASE64URL_DECODE
        );
        return new _Ed25519Signer(keyid, key);
      }
      async sign(data) {
        const message = new TextEncoder().encode(data);
        const signature = await crypto.subtle.sign(
          "ed25519",
          this.privateKey,
          message
        );
        return new Uint8Array(signature);
      }
    };
    RSAPSSSHA512Signer = class _RSAPSSSHA512Signer {
      static {
        __name(this, "_RSAPSSSHA512Signer");
      }
      static {
        __name2(this, "_RSAPSSSHA512Signer");
      }
      constructor(keyid, privateKey) {
        this.alg = "rsa-pss-sha512";
        this.keyid = keyid;
        this.privateKey = privateKey;
      }
      static async fromJWK(jwk) {
        const key = await crypto.subtle.importKey(
          "jwk",
          jwk,
          // restricting to RSA-PSS with SHA-512 as other SHA- algorithms are not registered
          { name: "RSA-PSS", hash: { name: "SHA-512" } },
          true,
          ["sign"]
        );
        const keyid = await jwkThumbprint(
          jwk,
          helpers.WEBCRYPTO_SHA256,
          helpers.BASE64URL_DECODE
        );
        return new _RSAPSSSHA512Signer(keyid, key);
      }
      async sign(data) {
        const message = new TextEncoder().encode(data);
        const signature = await crypto.subtle.sign(
          { name: "RSA-PSS", saltLength: 64 },
          this.privateKey,
          message
        );
        return new Uint8Array(signature);
      }
    };
    __name2(signerFromJWK, "signerFromJWK");
  }
});
function isAscii(str) {
  return asciiRe.test(str);
}
__name(isAscii, "isAscii");
function isValidTokenStr(str) {
  return tokenRe.test(str);
}
__name(isValidTokenStr, "isValidTokenStr");
function isValidKeyStr(str) {
  return keyRe.test(str);
}
__name(isValidKeyStr, "isValidKeyStr");
function arrayBufferToBase64(ab) {
  const bytes = new Uint8Array(ab);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
__name(arrayBufferToBase64, "arrayBufferToBase64");
var asciiRe;
var tokenRe;
var keyRe;
var init_util = __esm({
  "../node_modules/structured-headers/dist/util.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    asciiRe = /^[\x20-\x7E]*$/;
    tokenRe = /^[a-zA-Z*][:/!#$%&'*+\-.^_`|~A-Za-z0-9]*$/;
    keyRe = /^[a-z*][*\-_.a-z0-9]*$/;
    __name2(isAscii, "isAscii");
    __name2(isValidTokenStr, "isValidTokenStr");
    __name2(isValidKeyStr, "isValidKeyStr");
    __name2(arrayBufferToBase64, "arrayBufferToBase64");
  }
});
var Token;
var init_token = __esm({
  "../node_modules/structured-headers/dist/token.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_util();
    Token = class {
      static {
        __name(this, "Token");
      }
      static {
        __name2(this, "Token");
      }
      constructor(value) {
        if (!isValidTokenStr(value)) {
          throw new TypeError("Invalid character in Token string. Tokens must start with *, A-Z and the rest of the string may only contain a-z, A-Z, 0-9, :/!#$%&'*+-.^_`|~");
        }
        this.value = value;
      }
      toString() {
        return this.value;
      }
    };
  }
});
var DisplayString;
var init_displaystring = __esm({
  "../node_modules/structured-headers/dist/displaystring.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    DisplayString = class {
      static {
        __name(this, "DisplayString");
      }
      static {
        __name2(this, "DisplayString");
      }
      constructor(value) {
        this.value = value;
      }
      toString() {
        return this.value;
      }
    };
  }
});
function serializeItem(input, params) {
  if (Array.isArray(input)) {
    return serializeBareItem(input[0]) + serializeParameters(input[1]);
  } else {
    return serializeBareItem(input) + (params ? serializeParameters(params) : "");
  }
}
__name(serializeItem, "serializeItem");
function serializeBareItem(input) {
  if (typeof input === "number") {
    if (Number.isInteger(input)) {
      return serializeInteger(input);
    }
    return serializeDecimal(input);
  }
  if (typeof input === "string") {
    return serializeString(input);
  }
  if (input instanceof Token) {
    return serializeToken(input);
  }
  if (input instanceof ArrayBuffer) {
    return serializeByteSequence(input);
  }
  if (input instanceof DisplayString) {
    return serializeDisplayString(input);
  }
  if (input instanceof Date) {
    return serializeDate(input);
  }
  if (typeof input === "boolean") {
    return serializeBoolean(input);
  }
  throw new SerializeError(`Cannot serialize values of type ${typeof input}`);
}
__name(serializeBareItem, "serializeBareItem");
function serializeInteger(input) {
  if (input < -999999999999999 || input > 999999999999999) {
    throw new SerializeError("Structured headers can only encode integers in the range range of -999,999,999,999,999 to 999,999,999,999,999 inclusive");
  }
  return input.toString();
}
__name(serializeInteger, "serializeInteger");
function serializeDecimal(input) {
  const out = input.toFixed(3).replace(/0+$/, "");
  const signifantDigits = out.split(".")[0].replace("-", "").length;
  if (signifantDigits > 12) {
    throw new SerializeError("Fractional numbers are not allowed to have more than 12 significant digits before the decimal point");
  }
  return out;
}
__name(serializeDecimal, "serializeDecimal");
function serializeString(input) {
  if (!isAscii(input)) {
    throw new SerializeError("Only ASCII strings may be serialized");
  }
  return `"${input.replace(/("|\\)/g, (v) => "\\" + v)}"`;
}
__name(serializeString, "serializeString");
function serializeDisplayString(input) {
  let out = '%"';
  const textEncoder = new TextEncoder();
  for (const char of textEncoder.encode(input.toString())) {
    if (char === 37 || char === 34 || char <= 31 || char >= 127) {
      out += "%" + char.toString(16);
    } else {
      out += String.fromCharCode(char);
    }
  }
  return out + '"';
}
__name(serializeDisplayString, "serializeDisplayString");
function serializeBoolean(input) {
  return input ? "?1" : "?0";
}
__name(serializeBoolean, "serializeBoolean");
function serializeByteSequence(input) {
  return `:${arrayBufferToBase64(input)}:`;
}
__name(serializeByteSequence, "serializeByteSequence");
function serializeToken(input) {
  return input.toString();
}
__name(serializeToken, "serializeToken");
function serializeDate(input) {
  return "@" + Math.floor(input.getTime() / 1e3);
}
__name(serializeDate, "serializeDate");
function serializeParameters(input) {
  return Array.from(input).map(([key, value]) => {
    let out = ";" + serializeKey(key);
    if (value !== true) {
      out += "=" + serializeBareItem(value);
    }
    return out;
  }).join("");
}
__name(serializeParameters, "serializeParameters");
function serializeKey(input) {
  if (!isValidKeyStr(input)) {
    throw new SerializeError("Keys in dictionaries must only contain lowercase letter, numbers, _-*. and must start with a letter or *");
  }
  return input;
}
__name(serializeKey, "serializeKey");
var SerializeError;
var init_serializer = __esm({
  "../node_modules/structured-headers/dist/serializer.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_token();
    init_util();
    init_displaystring();
    SerializeError = class extends Error {
      static {
        __name(this, "SerializeError");
      }
      static {
        __name2(this, "SerializeError");
      }
    };
    __name2(serializeItem, "serializeItem");
    __name2(serializeBareItem, "serializeBareItem");
    __name2(serializeInteger, "serializeInteger");
    __name2(serializeDecimal, "serializeDecimal");
    __name2(serializeString, "serializeString");
    __name2(serializeDisplayString, "serializeDisplayString");
    __name2(serializeBoolean, "serializeBoolean");
    __name2(serializeByteSequence, "serializeByteSequence");
    __name2(serializeToken, "serializeToken");
    __name2(serializeDate, "serializeDate");
    __name2(serializeParameters, "serializeParameters");
    __name2(serializeKey, "serializeKey");
  }
});
var init_parser = __esm({
  "../node_modules/structured-headers/dist/parser.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_token();
    init_util();
    init_displaystring();
  }
});
var init_types = __esm({
  "../node_modules/structured-headers/dist/types.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
  }
});
var init_dist2 = __esm({
  "../node_modules/structured-headers/dist/index.js"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_serializer();
    init_parser();
    init_types();
    init_util();
    init_token();
    init_displaystring();
  }
});
function encode(u) {
  return btoa(String.fromCharCode(...u));
}
__name(encode, "encode");
function decode(b) {
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}
__name(decode, "decode");
function extractHeader({ headers }, header) {
  if (typeof headers.get === "function") return headers.get(header) ?? "";
  const lcHeader = header.toLowerCase();
  const key = Object.keys(headers).find(
    (name) => name.toLowerCase() === lcHeader
  );
  let val = key ? headers[key] ?? "" : "";
  if (Array.isArray(val)) {
    val = val.join(", ");
  }
  return val.toString().replace(/\s+/g, " ");
}
__name(extractHeader, "extractHeader");
function getUrl(message, component) {
  if ("url" in message && "protocol" in message) {
    const host = extractHeader(message, "host");
    const protocol = message.protocol || "http";
    const baseUrl = `${protocol}://${host}`;
    return new URL(message.url, baseUrl);
  }
  if (!message.url)
    throw new Error(`${component} is only valid for requests`);
  return new URL(message.url);
}
__name(getUrl, "getUrl");
function extractComponent(message, component) {
  switch (component) {
    case "@method":
      if (!message.method)
        throw new Error(`${component} is only valid for requests`);
      return message.method.toUpperCase();
    case "@target-uri":
      if (!message.url)
        throw new Error(`${component} is only valid for requests`);
      return message.url;
    case "@authority": {
      const url = getUrl(message, component);
      const port = url.port ? parseInt(url.port, 10) : null;
      return `${url.hostname}${port && ![80, 443].includes(port) ? `:${port}` : ""}`;
    }
    case "@scheme":
      return getUrl(message, component).protocol.slice(0, -1);
    case "@request-target": {
      const { pathname, search } = getUrl(message, component);
      return `${pathname}${search}`;
    }
    case "@path":
      return getUrl(message, component).pathname;
    case "@query":
      return getUrl(message, component).search;
    case "@status":
      if (!message.status)
        throw new Error(`${component} is only valid for responses`);
      return message.status.toString();
    case "@query-params":
      throw new Error(`${component} is not implemented yet`);
    default:
      throw new Error(`Unknown specialty component ${component}`);
  }
}
__name(extractComponent, "extractComponent");
function serializeComponent(cwp) {
  if (componentHasParameters(cwp)) {
    return serializeItem(`${cwp.name.toLowerCase()}`, cwp.parameters);
  }
  return `"${cwp.toLowerCase()}"`;
}
__name(serializeComponent, "serializeComponent");
function isRawMessage(message) {
  return message.response === void 0 && message.request === void 0;
}
__name(isRawMessage, "isRawMessage");
function componentHasParameters(component) {
  return component.parameters !== void 0;
}
__name(componentHasParameters, "componentHasParameters");
function resolveMessageKind(message, cwp) {
  let requiresReq = false;
  if (cwp !== void 0 && componentHasParameters(cwp)) {
    requiresReq = cwp.parameters.has("req");
  }
  if (isRawMessage(message)) {
    if (requiresReq) {
      throw new Error(
        "`req` component parameter can only be used with ResponseRequestPair message types"
      );
    }
    return message;
  }
  if (requiresReq) {
    return message.request;
  }
  return message.response;
}
__name(resolveMessageKind, "resolveMessageKind");
function buildSignatureInputString(componentNames, parameters) {
  const components = componentNames.map(serializeComponent).join(" ");
  const values = Object.entries(parameters).map(([parameter, value]) => {
    if (typeof value === "number") return `;${parameter}=${value}`;
    if (value instanceof Date)
      return `;${parameter}=${Math.floor(value.getTime() / 1e3)}`;
    return `;${parameter}="${value.toString()}"`;
  }).join("");
  return `(${components})${values}`;
}
__name(buildSignatureInputString, "buildSignatureInputString");
function buildSignedData(message, components, signatureInputString) {
  const parts = components.map((component) => {
    const messageToUse = resolveMessageKind(message, component);
    const componentName = componentHasParameters(component) ? component.name : component;
    const value = componentName.startsWith("@") ? extractComponent(messageToUse, componentName) : extractHeader(messageToUse, componentName);
    return `${serializeComponent(component)}: ${value}`;
  });
  parts.push(`"@signature-params": ${signatureInputString}`);
  return parts.join("\n");
}
__name(buildSignedData, "buildSignedData");
async function signatureHeaders(message, opts) {
  const { signer, components: _components, key: _key, ...params } = opts;
  const components = _components ?? ("status" in resolveMessageKind(message) ? defaultResponseComponents : defaultRequestComponents);
  const key = _key ?? "sig1";
  const signParams = {
    created: /* @__PURE__ */ new Date(),
    keyid: signer.keyid,
    alg: signer.alg,
    ...params
  };
  const signatureInputString = buildSignatureInputString(
    components,
    signParams
  );
  const dataToSign = buildSignedData(message, components, signatureInputString);
  const signature = await signer.sign(dataToSign);
  const sigBase64 = encode(signature);
  return {
    Signature: `${key}=:${sigBase64}:`,
    "Signature-Input": `${key}=${signatureInputString}`
  };
}
__name(signatureHeaders, "signatureHeaders");
async function directoryResponseHeaders(message, signers, params) {
  if (params.created.getTime() > params.expires.getTime()) {
    throw new Error("created should happen before expires");
  }
  const headers = /* @__PURE__ */ new Map();
  for (let i = 0; i < signers.length; i += 1) {
    const signer = signers[i];
    if (headers.has(signer.keyid)) {
      throw new Error(`Duplicated signer with keyid ${signer.keyid}`);
    }
    headers.set(
      signer.keyid,
      await signatureHeaders(message, {
        signer,
        components: RESPONSE_COMPONENTS,
        created: params.created,
        expires: params.expires,
        keyid: signer.keyid,
        key: `binding${i}`,
        tag: "http-message-signatures-directory"
        /* HTTP_MESSAGE_SIGNAGURES_DIRECTORY */
      })
    );
  }
  const SF_SEPARATOR = ", ";
  return {
    Signature: Array.from(headers.values()).map((h) => h.Signature).join(SF_SEPARATOR),
    "Signature-Input": Array.from(headers.values()).map((h) => h["Signature-Input"]).join(SF_SEPARATOR)
  };
}
__name(directoryResponseHeaders, "directoryResponseHeaders");
var __defProp22;
var __export2;
var base64_exports;
var defaultRequestComponents;
var defaultResponseComponents;
var RESPONSE_COMPONENTS;
var init_dist3 = __esm({
  "../node_modules/http-message-sig/dist/index.mjs"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_dist2();
    init_dist2();
    __defProp22 = Object.defineProperty;
    __export2 = /* @__PURE__ */ __name2((target, all) => {
      for (var name in all)
        __defProp22(target, name, { get: all[name], enumerable: true });
    }, "__export");
    base64_exports = {};
    __export2(base64_exports, {
      decode: /* @__PURE__ */ __name2(() => decode, "decode"),
      encode: /* @__PURE__ */ __name2(() => encode, "encode")
    });
    __name2(encode, "encode");
    __name2(decode, "decode");
    __name2(extractHeader, "extractHeader");
    __name2(getUrl, "getUrl");
    __name2(extractComponent, "extractComponent");
    __name2(serializeComponent, "serializeComponent");
    __name2(isRawMessage, "isRawMessage");
    __name2(componentHasParameters, "componentHasParameters");
    __name2(resolveMessageKind, "resolveMessageKind");
    __name2(buildSignatureInputString, "buildSignatureInputString");
    __name2(buildSignedData, "buildSignedData");
    defaultRequestComponents = [
      "@method",
      "@path",
      "@query",
      "@authority",
      "content-type",
      "digest"
    ];
    defaultResponseComponents = [
      "@status",
      "content-type",
      "digest"
    ];
    __name2(signatureHeaders, "signatureHeaders");
    RESPONSE_COMPONENTS = [
      {
        name: "@authority",
        parameters: /* @__PURE__ */ new Map([["req", true]])
      }
    ];
    __name2(directoryResponseHeaders, "directoryResponseHeaders");
  }
});
var init_dist4 = __esm({
  "../node_modules/web-bot-auth/dist/index.mjs"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_chunk_VXDWK3MV();
    init_dist3();
    init_dist3();
    init_dist();
  }
});
var init_crypto = __esm({
  "../node_modules/web-bot-auth/dist/crypto.mjs"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_chunk_VXDWK3MV();
  }
});
var web_bot_auth_directory_exports = {};
__export(web_bot_auth_directory_exports, {
  isWebBotAuthDirectory: /* @__PURE__ */ __name(() => isWebBotAuthDirectory, "isWebBotAuthDirectory"),
  signedDirectoryResponse: /* @__PURE__ */ __name(() => signedDirectoryResponse, "signedDirectoryResponse")
});
function isWebBotAuthDirectory(pathname) {
  return pathname === DIRECTORY_PATH;
}
__name(isWebBotAuthDirectory, "isWebBotAuthDirectory");
async function signedDirectoryResponse(request, jwksBody, privateJwkJson) {
  const privateJwk = JSON.parse(privateJwkJson);
  const signer = await signerFromJWK(privateJwk);
  const now = /* @__PURE__ */ new Date();
  const expires = new Date(now.getTime() + SIGNATURE_TTL_MS);
  const headers = new Headers({
    "Content-Type": CONTENT_TYPE,
    "Cache-Control": `public, max-age=${SIGNATURE_TTL_SEC}, must-revalidate`
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
  signed.set("Content-Type", CONTENT_TYPE);
  signed.set(
    "Cache-Control",
    `public, max-age=${SIGNATURE_TTL_SEC}, must-revalidate`
  );
  return new Response(jwksBody, {
    status: unsigned.status,
    statusText: unsigned.statusText,
    headers: signed
  });
}
__name(signedDirectoryResponse, "signedDirectoryResponse");
var DIRECTORY_PATH;
var CONTENT_TYPE;
var SIGNATURE_TTL_MS;
var SIGNATURE_TTL_SEC;
var init_web_bot_auth_directory = __esm({
  "web-bot-auth-directory.ts"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_dist4();
    init_crypto();
    DIRECTORY_PATH = "/.well-known/http-message-signatures-directory";
    CONTENT_TYPE = "application/http-message-signatures-directory+json";
    SIGNATURE_TTL_MS = 6e4;
    SIGNATURE_TTL_SEC = SIGNATURE_TTL_MS / 1e3;
    __name2(isWebBotAuthDirectory, "isWebBotAuthDirectory");
    __name2(signedDirectoryResponse, "signedDirectoryResponse");
  }
});
function markdownHeaders(pathname) {
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  if (isHomepagePath(pathname)) {
    headers.set("Link", LINK_HEADER);
  }
  headers.set("Content-Signal", CONTENT_SIGNAL);
  return headers;
}
__name(markdownHeaders, "markdownHeaders");
async function serveMarkdown(request, env, url, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }
  if (!wantsMarkdown(request.headers.get("Accept"))) {
    return null;
  }
  const mdPath = resolveMarkdownAssetPath(pathname);
  if (!mdPath) return null;
  const mdResponse = await env.ASSETS.fetch(
    new Request(new URL(mdPath, url.origin), request)
  );
  if (!mdResponse.ok) return null;
  const body = await mdResponse.text();
  const headers = markdownHeaders(pathname);
  headers.set("x-markdown-tokens", estimateMarkdownTokens(body));
  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(body, { status: 200, headers });
}
__name(serveMarkdown, "serveMarkdown");
async function withDiscoveryHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  if (resolveMarkdownAssetPath(pathname)) {
    headers.set("Vary", "Accept");
  }
  if (!isHomepagePath(pathname)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  headers.set("Link", LINK_HEADER);
  headers.set("Content-Signal", CONTENT_SIGNAL);
  const body = await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
__name(withDiscoveryHeaders, "withDiscoveryHeaders");
var LINK_HEADER;
var CONTENT_SIGNAL;
var WEB_BOT_AUTH_DIRECTORY;
var onRequest;
var init_middleware = __esm({
  "_middleware.ts"() {
    init_functionsRoutes_0_21206856548071307();
    init_checked_fetch();
    init_markdown_negotiation();
    LINK_HEADER = '</.well-known/api-catalog>; rel="api-catalog", </.well-known/agent-skills/index.json>; rel="describedby", </openapi/site-api.yaml>; rel="service-desc"; type="application/yaml", </docs/api>; rel="service-doc"; type="text/html", </.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"';
    CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";
    WEB_BOT_AUTH_DIRECTORY = "/.well-known/http-message-signatures-directory";
    __name2(markdownHeaders, "markdownHeaders");
    __name2(serveMarkdown, "serveMarkdown");
    __name2(withDiscoveryHeaders, "withDiscoveryHeaders");
    onRequest = /* @__PURE__ */ __name2(async (context) => {
      const { request, next, env } = context;
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === WEB_BOT_AUTH_DIRECTORY && env.WEB_BOT_AUTH_PRIVATE_JWK) {
        const { signedDirectoryResponse: signedDirectoryResponse2 } = await Promise.resolve().then(() => (init_web_bot_auth_directory(), web_bot_auth_directory_exports));
        const asset = await env.ASSETS.fetch(
          new Request(new URL(WEB_BOT_AUTH_DIRECTORY, url.origin), request)
        );
        if (asset.ok) {
          const body = await asset.text();
          return signedDirectoryResponse2(
            request,
            body,
            env.WEB_BOT_AUTH_PRIVATE_JWK
          );
        }
      }
      const markdownResponse = await serveMarkdown(request, env, url, url.pathname);
      if (markdownResponse) return markdownResponse;
      const response = await next();
      return withDiscoveryHeaders(response, url.pathname);
    }, "onRequest");
  }
});
var routes;
var init_functionsRoutes_0_21206856548071307 = __esm({
  "../.wrangler/tmp/pages-OKa5oP/functionsRoutes-0.21206856548071307.mjs"() {
    init_middleware();
    routes = [
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest],
        modules: []
      }
    ];
  }
});
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode2 = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode2(value, key);
        });
      } else {
        params[key.name] = decode2(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode2 = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode2(token));
    } else {
      var prefix = escapeString(encode2(token.prefix));
      var suffix = escapeString(encode2(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_21206856548071307();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object" && middleware_insertion_facade_default !== null) {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
} else {
  throw new Error(
    `Invalid worker entry point: expected an ExportedHandler object or WorkerEntrypoint class, received ${middleware_insertion_facade_default === null ? "null" : typeof middleware_insertion_facade_default}. Check that Pages Functions compile and export handlers correctly.`
  );
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-Rld8Tl/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-Rld8Tl/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object" && middleware_insertion_facade_default2 !== null) {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
} else {
  throw new Error(
    `Invalid worker entry point: expected an ExportedHandler object or WorkerEntrypoint class, received ${middleware_insertion_facade_default2 === null ? "null" : typeof middleware_insertion_facade_default2}. Check that Pages Functions compile and export handlers correctly.`
  );
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.36492162095244773.js.map
