import { AnalyticsEvent } from "../entities/AnalyticsEvent";

export interface AnalyticsRepository {
    send: (event: AnalyticsEvent, code: string) => void;
}
