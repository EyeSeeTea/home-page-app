import { PersistedAction } from "../../data/entities/PersistedAction";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class ImportActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public async execute(files: File[]): Promise<PersistedAction[]> {
        return this.actionRepository.import(files);
    }
}
