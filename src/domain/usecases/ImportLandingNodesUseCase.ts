import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ImportLandingNodesUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(files: File[]): Promise<PersistedLandingNode[]> {
        return this.landingNodeRepository.import(files);
    }
}
