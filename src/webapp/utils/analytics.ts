export interface AnalyticsEvent {
    name: "page_view";
    pageLocation: string;
    pageTitle: string;
}

export interface AnalyticsTrackerImp {
    send: (event: AnalyticsEvent) => void;
}

export function sendAnalyticsEvents(options: { analyticsTrackers: AnalyticsTrackerImp[]; event: AnalyticsEvent }) {
    const { analyticsTrackers, event } = options;
    analyticsTrackers.forEach(tracker => tracker.send(event));
}

export type SendAnalyticsEventType = (event: AnalyticsEvent) => void;
