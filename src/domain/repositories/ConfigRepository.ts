import { Instance } from "../../data/entities/Instance";
import { Permission } from "../entities/Permission";
import { User } from "../entities/User";

export interface ConfigRepository {
    getUser(): Promise<User>;
    getInstance(): Instance;
    getSettingsPermissions(): Promise<Permission>;
    updateSettingsPermissions(update: Partial<Permission>): Promise<void>;
    getShowAllActions(): Promise<boolean>;
    setShowAllActions(flag: boolean): Promise<void>;
}
