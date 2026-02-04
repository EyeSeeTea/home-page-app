import { AnalyticsEvent, AnalyticsTrackerImp } from "./analytics";

export class MatomoAnalytics implements AnalyticsTrackerImp {
    constructor(private readonly code: string) {}

    send(event: AnalyticsEvent) {
        if (!window._paq || !this.code) return;

        window._paq.push(["setCustomUrl", event.pageLocation]);
        window._paq.push(["setDocumentTitle", event.pageTitle]);
        window._paq.push(["trackPageView"]);
    }
}

export type MatomoCommand = ["setCustomUrl", string] | ["setDocumentTitle", string] | ["trackPageView"];
export type MatomoPush = { push(...commands: MatomoCommand[]): number };

declare global {
    interface Window {
        _paq: MatomoPush;
    }
}
