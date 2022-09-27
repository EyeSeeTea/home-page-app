import { UseCase } from "./UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class GetInstanceVersionUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public execute(): Promise<string> {
        return this.instanceRepository.getVersion();
    }
}
