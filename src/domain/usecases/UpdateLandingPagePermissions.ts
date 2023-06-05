import { LandingPagePermission } from "../entities/Permission";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { UseCase } from "./UseCase";

export class UpdateLandingPagePermissionsUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(update: Partial<LandingPagePermission>, id: string): Promise<void> {
        await this.configRepository.updateLandingPagePermissions(update, id);
    }
}
