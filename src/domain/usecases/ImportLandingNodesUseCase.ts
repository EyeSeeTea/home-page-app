import { ImportExportClient } from "../../data/clients/importExport/ImportExportClient";
import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { updateLandingNode } from "../../data/repositories/LandingNodeDefaultRepository";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ImportLandingNodesUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository, private importExportClient: ImportExportClient) {}

    public async execute(files: File[]): Promise<PersistedLandingNode[]> {
        const items = await this.importExportClient.import<PersistedLandingNode>(files);
        const persisted = await this.landingNodeRepository.getPersistedLandingPages();
        const mergedLandings = updateLandingNode(persisted, items, true);
        await this.landingNodeRepository.save(mergedLandings);

        return items;
    }
}
