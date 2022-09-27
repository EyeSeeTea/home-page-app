import { NamedRef } from "../entities/Ref";
import { InstanceRepository } from "../repositories/InstanceRepository";
import { UseCase } from "./UseCase";

export class ListDanglingDocumentsUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(): Promise<NamedRef[]> {
        return this.instanceRepository.listDanglingDocuments();
    }
}
