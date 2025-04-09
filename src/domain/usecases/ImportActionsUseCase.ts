import i18n from "../../utils/i18n";
import { ImportExportClient } from "../../data/clients/importExport/ImportExportClient";
import { PersistedAction } from "../../data/entities/PersistedAction";
import { ActionRepository } from "../repositories/ActionRepository";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ImportActionsUseCase implements UseCase {
    constructor(
        private actionRepository: ActionRepository,
        private landingRepository: LandingNodeRepository,
        private importExportClient: ImportExportClient
    ) {}

    public async execute(files: File[]): Promise<PersistedAction[]> {
        const items = await this.importExportClient.import<PersistedAction>(files);
        const nodes = await this.landingRepository.getAll();
        const valid = items.every(action => {
            if (action.type !== "page") return true;
            const landing = nodes.find(node => node.id === action.launchPageId);
            if (!landing) return false;
            return !landing.actions.some(actionId => actionId === action.id);
        });

        if (valid) return this.actionRepository.save(items);
        else return Promise.reject(i18n.t("Unable to import actions. Some action is referencing an invalid page."));
    }
}
