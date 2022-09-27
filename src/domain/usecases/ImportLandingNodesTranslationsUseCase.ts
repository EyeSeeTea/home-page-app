import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class ImportLandingNodesTranslationsUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(lang: string, terms: Record<string, string>): Promise<number> {
        return this.landingNodeRepository.importTranslations(lang, terms);
    }
}
