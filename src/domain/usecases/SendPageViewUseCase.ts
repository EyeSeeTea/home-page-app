import { AnalyticsEvent } from "../entities/AnalyticsEvent";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { ConfigRepository } from "../repositories/ConfigRepository";

export class SendPageViewUseCase {
    constructor(private analyticsRepository: AnalyticsRepository, private configRepository: ConfigRepository) {}

    public async execute(options: { location: string; title: string }) {
        const gaCode = await this.configRepository.getGoogleAnalyticsCode();
        if (!gaCode) return; // No GA code, no tracking. We really want to throw an Error, so is always needed to check in every step if the code exists?

        const defaultOptions: AnalyticsEvent = {
            name: "page_view",
            pageLocation: options.location,
            pageTitle: options.title,
        };

        this.analyticsRepository.send(defaultOptions, gaCode);
    }
}
