import { UseCase } from "./UseCase";
import { ActionRepository } from "../repositories/ActionRepository";

export class ExportActionTranslationsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public async execute(actionKey: string): Promise<void> {
        await this.actionRepository.exportTranslations(actionKey);
    }
}
