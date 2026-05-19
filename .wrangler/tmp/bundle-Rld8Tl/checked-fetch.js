const state = globalThis.__WRANGLER_CHECKED_FETCH__ ?? {
	urls: new Set(),
	wrapped: false,
};
globalThis.__WRANGLER_CHECKED_FETCH__ = state;

function checkURL(request, init) {
	const url =
		request instanceof URL
			? request
			: new URL(
					(typeof request === "string" ? new Request(request, init) : request)
						.url
				);
	if (url.port && url.port !== "443" && url.protocol === "https:") {
		if (!state.urls.has(url.toString())) {
			state.urls.add(url.toString());
			console.warn(
				`WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:\n` +
					` - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.\n`
			);
		}
	}
}

if (!state.wrapped) {
	state.wrapped = true;
	const nativeFetch = globalThis.fetch;
	globalThis.fetch = new Proxy(nativeFetch, {
		apply(target, thisArg, argArray) {
			const [request, init] = argArray;
			checkURL(request, init);
			return Reflect.apply(target, thisArg, argArray);
		},
	});
}
