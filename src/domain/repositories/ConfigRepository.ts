import { Instance } from "../../data/entities/Instance";
import { LandingPagePermission, Permission } from "../entities/Permission";
import { User } from "../entities/User";

export interface ConfigRepository {
    getUser(): Promise<User>;
    getInstance(): Instance;
    getDefaultApplication(): Promise<string>;
    updateDefaultApplication(defaultApplication: string): Promise<void>;
    getSettingsPermissions(): Promise<Permission>;
    updateSettingsPermissions(update: Partial<Permission>): Promise<void>;
    getLandingPagePermissions(): Promise<LandingPagePermission[]>;
    updateLandingPagePermissions(update: Partial<LandingPagePermission>, id: string): Promise<void>;
    getShowAllActions(): Promise<boolean>;
    setShowAllActions(flag: boolean): Promise<void>;
}
