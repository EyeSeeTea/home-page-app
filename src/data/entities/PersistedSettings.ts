import { AnalyticsConfig } from "../../domain/entities/AnalyticsConfig";
import { LandingPagePermission, Permission } from "../../domain/entities/Permission";

export interface PersistedSettings {
    poeditorToken?: string;
    defaultApplication?: string;
    settingsPermissions?: Permission;
    landingPagePermissions?: LandingPagePermission[];
    showAllActions?: boolean;
    analyticsConfig?: AnalyticsConfig;
}
