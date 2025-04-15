import { MatomoAnalyticsRepository } from "../../data/repositories/MatomoAnalyticsRepository";
import { AnalyticsEvent } from "../entities/AnalyticsEvent";
import { AnalyticsConfigRepository } from "../repositories/AnalyticsConfigRepository";

export class TrackMatomoViewUseCase {
    constructor(
        private configRepository: AnalyticsConfigRepository,
        private matomoAnalytics: MatomoAnalyticsRepository
    ) {}

    public async execute(options?: { location?: string; title?: string }) {
        const config = await this.configRepository.get();
        if (!config.codeUrl) return;

        const defaultOptions: AnalyticsEvent = {
            name: "page_view",
            pageLocation: options?.location ?? window.location.hash.split("?")[0] ?? window.location.href,
            pageTitle: options?.title ?? document.title,
        };

        this.matomoAnalytics.send(defaultOptions, config.codeUrl);
    }
}
