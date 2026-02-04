import { Maybe } from "../../types/utils";
import { Action } from "../entities/Action";
import { ActionRepository } from "../repositories/ActionRepository";
import { InstanceRepository } from "../repositories/InstanceRepository";
import { UseCase } from "./UseCase";

export class GetActionByIdUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository, private instanceRepository: InstanceRepository) {}

    public async execute(id: string): Promise<Maybe<Action>> {
        const installedApps = await this.instanceRepository.listInstalledApps();
        return this.actionRepository.get(id, installedApps);
    }
}
