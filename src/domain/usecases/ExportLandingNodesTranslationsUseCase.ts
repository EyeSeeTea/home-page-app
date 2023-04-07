import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ExportLandingNodesTranslationsUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(ids: string[]): Promise<void> {
        await this.landingNodeRepository.exportTranslations(ids);
    }
}
