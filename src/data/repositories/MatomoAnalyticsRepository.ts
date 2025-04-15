import { AnalyticsEvent } from "../../domain/entities/AnalyticsEvent";
import { AnalyticsRepository } from "../../domain/repositories/AnalyticsRepository";

export class MatomoAnalyticsRepository implements AnalyticsRepository {
    send(event: AnalyticsEvent, code: string) {
        if (!window._paq || !code) return;

        window._paq.push(["setCustomUrl", event.pageLocation]);
        window._paq.push(["setDocumentTitle", event.pageTitle]);
        window._paq.push(["trackPageView"]);
    }
}

export type MatomoCommand = ["setCustomUrl", string] | ["setDocumentTitle", string] | ["trackPageView"];
export type MatomoPush = { push(...commands: MatomoCommand[]): number };

declare global {
    interface Window {
        _paq: { push(...commands: MatomoCommand[]): number };
    }
}
