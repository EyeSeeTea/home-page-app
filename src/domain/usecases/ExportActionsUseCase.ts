import { ImportExportClient } from "../../data/clients/importExport/ImportExportClient";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class ExportActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository, private importExportClient: ImportExportClient) {}

    public async execute(ids: string[]): Promise<void> {
        const actions = await this.actionRepository.getPersistedActions();
        const toSave = actions.filter(action => ids.includes(action.id));

        return await this.importExportClient.export(toSave);
    }
}
