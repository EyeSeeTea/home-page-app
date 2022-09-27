import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class ImportActionTranslationsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public async execute(key: string, lang: string, terms: Record<string, string>): Promise<number> {
        return this.actionRepository.importTranslations(key, lang, terms);
    }
}
