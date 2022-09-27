import _ from "lodash";
import { NamedRef } from "../entities/Ref";
import { User } from "../entities/User";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { UseCase } from "./UseCase";

export class CheckSettingsPermissionsUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<boolean> {
        const user = await this.configRepository.getUser();
        const permissions = await this.configRepository.getSettingsPermissions();

        const isAdmin = !!user.userRoles.find(role => role.authorities.find(authority => authority === "ALL"));

        const sharedByUser = this.findCurrentUser(user, permissions.users ?? []);
        const sharedByGroup = this.findCurrentUser(user, permissions.userGroups ?? []);

        return isAdmin || sharedByUser || sharedByGroup;
    }

    private findCurrentUser(user: User, collection: NamedRef[]): boolean {
        return !_([user, ...user.userGroups])
            .intersectionBy(collection, userGroup => userGroup.id)
            .isEmpty();
    }
}
