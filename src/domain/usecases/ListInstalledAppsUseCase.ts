import { InstalledApp } from "../entities/InstalledApp";
import { InstanceRepository } from "../repositories/InstanceRepository";
import { UseCase } from "./UseCase";

export class ListInstalledAppsUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(): Promise<InstalledApp[]> {
        return this.instanceRepository.listInstalledApps();
    }
}
