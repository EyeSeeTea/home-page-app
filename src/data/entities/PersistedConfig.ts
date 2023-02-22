import { Permission } from "../../domain/entities/Permission";

export interface LandingPagePermission extends Permission {
    id: string;
}

export interface PersistedConfig {
    poeditorToken?: string;
    settingsPermissions?: Permission;
    landingPagePermissions?: LandingPagePermission[];
    showAllActions?: boolean;
}
