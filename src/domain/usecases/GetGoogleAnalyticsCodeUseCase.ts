import { UseCase } from "./UseCase";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Maybe } from "../../types/utils";

export class GetGoogleAnalyticsCodeUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<Maybe<string>> {
        return this.configRepository.getGoogleAnalyticsCode();
    }
}
