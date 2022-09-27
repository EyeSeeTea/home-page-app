import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class ExportActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.actionRepository.export(ids);
    }
}
