import { UseCase } from "./UseCase";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { LandingPagePermission } from "../entities/Permission";

export class GetLandingPagePermissionsUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<LandingPagePermission[]> {
        return this.configRepository.getLandingPagePermissions();
    }
}
