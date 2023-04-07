import { UseCase } from "./UseCase";
import { ConfigRepository } from "../repositories/ConfigRepository";

export class GetDefaultApplicationUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<string> {
        return this.configRepository.getDefaultApplication();
    }
}
