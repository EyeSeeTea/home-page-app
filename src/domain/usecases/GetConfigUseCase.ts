import { UseCase } from "./UseCase";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Config } from "../../data/entities/Config";

export class GetConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<Config> {
        return this.configRepository.get();
    }
}
