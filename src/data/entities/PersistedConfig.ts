import { LandingPagePermission, Permission } from "../../domain/entities/Permission";

export interface PersistedConfig {
    poeditorToken?: string;
    defaultApplication?: string;
    settingsPermissions?: Permission;
    landingPagePermissions?: LandingPagePermission[];
    showAllActions?: boolean;
}
