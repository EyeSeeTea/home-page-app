import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ExportLandingNodesUseCase implements UseCase {
    constructor(private landingPageRepository: LandingNodeRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.landingPageRepository.export(ids);
    }
}
