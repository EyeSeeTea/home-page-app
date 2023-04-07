import { ConfigRepository } from "../repositories/ConfigRepository";
import { UseCase } from "./UseCase";

export class UpdateDefaultApplicationUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(defaultApplication: string): Promise<void> {
        return this.configRepository.updateDefaultApplication(defaultApplication);
    }
}
