import { InstanceRepository } from "../repositories/InstanceRepository";
import { UseCase } from "./UseCase";

export class DeleteDocumentsUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.instanceRepository.deleteDocuments(ids);
    }
}
