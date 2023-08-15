export function goTo(url: string, options: { baseUrl: string }) {
    const isUrlAbsolute = url.startsWith("http://") || url.startsWith("https://");
    const href = isUrlAbsolute ? url : options.baseUrl + url;
    window.location.href = href;
}
