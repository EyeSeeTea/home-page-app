import { ImportExportClient } from "../../data/clients/importExport/ImportExportClient";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ExportLandingNodesUseCase implements UseCase {
    constructor(private landingPageRepository: LandingNodeRepository, private importExportClient: ImportExportClient) {}

    public async execute(ids: string[]): Promise<void> {
        const nodes = await this.landingPageRepository.getPersistedLandingPages();
        const toSave = nodes.filter(node => node.find(item => ids.includes(item.id)));

        return await Promise.all(toSave.map(node => this.importExportClient.export(node))).then(() => {});
    }
}
