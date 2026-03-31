import { ImportExportClient } from "../../data/clients/importExport/ImportExportClient";
import { PersistedLandingNode, PersistedLandingNodeWithPermissions } from "../../data/entities/PersistedLandingNode";
import { LandingPagePermission } from "../../domain/entities/Permission";
import { Settings } from "../entities/Settings";
import { updateLandingNode } from "../../data/repositories/LandingNodeDefaultRepository";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { UseCase } from "./UseCase";

export class ImportLandingNodesUseCase implements UseCase {
    constructor(
        private landingNodeRepository: LandingNodeRepository,
        private importExportClient: ImportExportClient,
        private settingsRepository: SettingsRepository
    ) {}

    public async execute(files: File[]): Promise<PersistedLandingNode[]> {
        const items = await this.importExportClient.import<PersistedLandingNodeWithPermissions>(files);
        const nodes: PersistedLandingNode[] = items.map(page => {
            const { sharingSettings: _sharingSettings, ...rest } = page;
            return rest;
        });
        const persisted = await this.landingNodeRepository.getPersistedLandingPages();
        /* Now: If some items are saved in dataStore, only the ones saved in dataStore will be saved,
        so other items will not be imported. Although that should not be the case, at least when there is no item saved
        on dataStore the items are just concatenated */
        const mergedLandings = updateLandingNode(persisted, nodes, true);
        await this.landingNodeRepository.save(mergedLandings);

        const newPermissions: LandingPagePermission[] = items.flatMap(page =>
            page.sharingSettings ? page.sharingSettings : []
        );

        const settings = await this.settingsRepository
            .get()
            .toPromise()
            .then(settings => {
                const landingPagePermissions = settings.landingPagePermissions;
                const mergedPermissions = newPermissions.reduce((acc, perm) => {
                    const existingIndex = acc.findIndex(p => p.id === perm.id);
                    if (existingIndex !== -1) {
                        acc[existingIndex] = perm;
                    } else {
                        acc.push(perm);
                    }
                    return acc;
                }, landingPagePermissions);
                return {
                    ...settings,
                    landingPagePermissions: mergedPermissions,
                };
            });

        await this.settingsRepository.save(new Settings(settings)).toPromise();

        return nodes;
    }
}
