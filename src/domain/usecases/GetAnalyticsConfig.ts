import { UseCase } from "./UseCase";
import { AnalyticsConfigRepository } from "../repositories/AnalyticsConfigRepository";
import { AnalyticsConfig } from "../entities/AnalyticsConfig";

export class GetAnalyticsConfig implements UseCase {
    constructor(private analyticsConfigRepository: AnalyticsConfigRepository) {}

    public async execute(): Promise<AnalyticsConfig> {
        return this.analyticsConfigRepository.get();
    }
}
