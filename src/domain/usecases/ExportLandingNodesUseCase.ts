import { ImportExportClient } from "../../data/clients/importExport/ImportExportClient";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { UseCase } from "./UseCase";
import { PersistedLandingPageWithPermissions } from "../../data/entities/PersistedLandingNode";

export class ExportLandingNodesUseCase implements UseCase {
    constructor(
        private landingPageRepository: LandingNodeRepository,
        private importExportClient: ImportExportClient,
        private settingsRepository: SettingsRepository
    ) {}

    public async execute(ids: string[]): Promise<void> {
        const nodes = await this.landingPageRepository.getPersistedLandingPages();
        const nodesToSave = nodes.filter(node => node.find(item => ids.includes(item.id)));
        const nodesToSaveIds = nodesToSave.map(page => page.map(item => item.id)).flat();
        const sharings = await this.settingsRepository
            .get()
            .toPromise()
            .then(perms => perms.landingPagePermissions.filter(perm => nodesToSaveIds.includes(perm.id)));
        const nodesToSaveWithPermissions: PersistedLandingPageWithPermissions[] = nodesToSave.map(page => {
            return page.map(item => {
                const sharingSettings = sharings?.find(p => p.id === item.id);
                return sharingSettings ? { ...item, sharingSettings: sharingSettings } : item;
            });
        });

        return await Promise.all(nodesToSaveWithPermissions.map(node => this.importExportClient.export(node))).then(
            () => {}
        );
    }
}
