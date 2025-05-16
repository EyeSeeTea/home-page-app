import { UseCase } from "./UseCase";
import { AnalyticsConfigRepository } from "../repositories/AnalyticsConfigRepository";
import { AnalyticsConfig } from "../entities/AnalyticsConfig";

export class SaveAnalyticsConfigUseCase implements UseCase {
    constructor(private analyticsConfigRepository: AnalyticsConfigRepository) {}

    public async execute(config: AnalyticsConfig): Promise<void> {
        return this.analyticsConfigRepository.save(config);
    }
}
