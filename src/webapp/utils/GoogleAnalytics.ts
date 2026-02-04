import { AnalyticsEvent, AnalyticsTrackerImp } from "./analytics";

export class GoogleAnalytics implements AnalyticsTrackerImp {
    private analytics?: Analytics;

    constructor(private readonly code: string) {}

    send(event: AnalyticsEvent) {
        if (!this.analytics) this.analytics = new Analytics(event, this.code);
        this.analytics.sendAnalytics(event);
    }
}

class Analytics {
    constructor(event: AnalyticsEvent, code: string) {
        if (!window.gtag) throw new Error("gtag() function has not been declared.");
        window.gtag("js", new Date());
        this.setAnalyticsConfig(event, code);
    }

    sendAnalytics(event: AnalyticsEvent) {
        console.debug("GA4: send analytics event", event.name, buildAnalyticsEvent(event));
        window.gtag("event", event.name, buildAnalyticsEvent(event));
    }

    setAnalyticsConfig(event: AnalyticsEvent, code: string) {
        /** When using HashRouter, set send_page_view to false to avoid sending dynamic page
         * events. When HashRouter is not used, set to true to avoid duplicated events.
         * */
        console.debug("GA4: config", code, { ...buildAnalyticsEvent(event), send_page_view: false });
        window.gtag("config", code, { ...buildAnalyticsEvent(event), send_page_view: false });
    }
}

function buildAnalyticsEvent(event: AnalyticsEvent) {
    return {
        page_location: event.pageLocation,
        page_title: event.pageTitle,
    };
}
