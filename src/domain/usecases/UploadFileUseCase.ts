import { InstanceRepository } from "../repositories/InstanceRepository";
import { UseCase } from "./UseCase";

export class UploadFileUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(data: ArrayBuffer, name: string): Promise<string> {
        return this.instanceRepository.uploadFile(data, { name });
    }
}
