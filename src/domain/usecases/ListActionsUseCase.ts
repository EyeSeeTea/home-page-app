import _ from "lodash";
import { Action } from "../entities/Action";
import { ActionRepository } from "../repositories/ActionRepository";
import { UseCase } from "./UseCase";
import { InstanceRepository } from "../repositories/InstanceRepository";
import { User } from "../entities/User";

export class ListActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository, private instanceRepository: InstanceRepository) {}

    public async execute(user: User): Promise<Action[]> {
        const installedApps = await this.instanceRepository.listInstalledApps();
        const actions = await this.actionRepository.getAll(installedApps);
        return actions.filter(({ dhisAuthorities }) => {
            const userAuthorities = user.userRoles.flatMap(({ authorities }) => authorities);

            return _.every(
                dhisAuthorities,
                authority => userAuthorities.includes("ALL") || userAuthorities.includes(authority)
            );
        });
    }
}
