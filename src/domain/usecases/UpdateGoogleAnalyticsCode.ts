import { ConfigRepository } from "../repositories/ConfigRepository";
import { UseCase } from "./UseCase";

export class UpdateGoogleAnalyticsCode implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(code: string): Promise<void> {
        return this.configRepository.updateGoogleAnalyticsCode(code);
    }
}
