import { SettingsRepository } from "../repositories/SettingsRepository";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";
import { Settings } from "../entities/Settings";

export class DeleteLandingNodesUseCase implements UseCase {
    constructor(
        private landingPagesRepository: LandingNodeRepository,
        private settingsRepository: SettingsRepository
    ) {}

    public async execute(ids: string[]): Promise<void> {
        await this.landingPagesRepository.deleteNodes(ids);
        const settings = await this.settingsRepository
            .get()
            .toPromise()
            .then(settings => {
                const landingPagePermissions = settings.landingPagePermissions;
                const updatedPermissions = landingPagePermissions.filter(perm => !ids.includes(perm.id));
                return {
                    ...settings,
                    landingPagePermissions: updatedPermissions,
                };
            });

        await this.settingsRepository.save(new Settings(settings)).toPromise();
    }
}
