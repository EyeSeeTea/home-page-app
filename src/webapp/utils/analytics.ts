export function sendAnalytics(name: string, data?: object) {
    if (!window.gtag) throw new Error("gtag() function has not been declared.");
    window.gtag(
        "event",
        name,
        data
        // Relevant params to track. Only add if the client allows it
        // data && {
        //     ...data,
        //     location_hash: window.location.hash,
        //     location_pathname: window.location.pathname,
        //     location_href: window.location.href,
        // }
    );
}
