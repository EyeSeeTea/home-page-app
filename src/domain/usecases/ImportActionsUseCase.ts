import i18n from "@eyeseetea/d2-ui-components/locales";
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
        if (
            items.every(async action => {
                if (action.type !== "page") return true;
                const landing = await this.landingRepository.getById(action.launchPageId);
                if (!landing) return false;
                if (landing.actions.some(actionId => actionId === action.id)) return false;
                return true;
            })
        )
            return this.actionRepository.save(items);
        else
            throw Error(
                i18n.t("Unable to import actions. Some landing page action is referencing the landing itself.")
            );
    }
}
