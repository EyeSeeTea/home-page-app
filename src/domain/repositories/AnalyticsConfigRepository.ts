import { AnalyticsConfig } from "../entities/AnalyticsConfig";

export interface AnalyticsConfigRepository {
    get(): Promise<AnalyticsConfig>;
    save(config: AnalyticsConfig): Promise<void>;
}
