import { Config } from "../../data/entities/Config";
import { Instance } from "../../data/entities/Instance";
import { Maybe } from "../../types/utils";
import { LandingPagePermission, Permission } from "../entities/Permission";
import { User } from "../entities/User";

export interface ConfigRepository {
    get(): Promise<Config>;
    getUser(): Promise<User>;
    getInstance(): Instance;
    getDefaultApplication(): Promise<string>;
    updateDefaultApplication(defaultApplication: string): Promise<void>;
    getGoogleAnalyticsCode(): Promise<Maybe<string>>;
    updateGoogleAnalyticsCode(code: string): Promise<void>;
    getSettingsPermissions(): Promise<Permission>;
    updateSettingsPermissions(update: Partial<Permission>): Promise<void>;
    getLandingPagePermissions(): Promise<LandingPagePermission[]>;
    updateLandingPagePermissions(update: Partial<LandingPagePermission>, id: string): Promise<void>;
    getShowAllActions(): Promise<boolean>;
    setShowAllActions(flag: boolean): Promise<void>;
}
