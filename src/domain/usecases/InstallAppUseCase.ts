import { InstanceRepository } from "../repositories/InstanceRepository";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";

export class InstallAppUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository, private actionRepository: ActionRepository) {}

    public async execute(actionId: string): Promise<boolean> {
        const installedApps = await this.instanceRepository.listInstalledApps();
        const action = await this.actionRepository.get(actionId, installedApps);
        if (!action?.name) return false;

        // TODO: We should store app hub id on model instead of using display name
        return this.instanceRepository.installApp(action.name.referenceValue);
    }
}
