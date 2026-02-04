import compact from "lodash/compact";
import { useCallback, useMemo } from "react";
import { PermissionHandlerProps, SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";
import { User } from "../../../domain/entities/User";
import { Maybe } from "../../../types/utils";
import { LandingNode, updateLandings } from "../../../domain/entities/LandingNode";
import { AnalyticsConfig } from "../../../domain/entities/AnalyticsConfig";
import { GoogleAnalytics } from "../../utils/GoogleAnalytics";
import { MatomoAnalytics } from "../../utils/matomo";
import { AnalyticsEvent, sendAnalyticsEvents, SendAnalyticsEventType } from "../../utils/analytics";
import i18n from "../../../utils/i18n";
import { useAccessPermissionsDialog } from "./useAccessPermissionsDialog";
import { Settings } from "../../../domain/entities/Settings";
import { LandingPagePermission } from "../../../domain/entities/Permission";

type UseConfigPloc = {
    settingPermissionsDialogProps: PermissionHandlerProps;
    settings: Settings;
    user?: User;
    userLandings: Maybe<LandingNode[]>;
    updateAnalyticsConfig: (config: AnalyticsConfig) => Promise<void>;
    updateDefaultApplication: (value: string) => void;
    updateLandingPagePermissions: (sharedUpdate: SharedUpdate, id: string) => Promise<void>;
    updateShowAllActions: (value: boolean) => void;
    trackViews: SendAnalyticsEventType;
};

export function useConfig(): UseConfigPloc {
    const { compositionRoot, currentUser, landings, settings, updateSettings } = useAppContext();

    const userLandings = useMemo<LandingNode[] | undefined>(() => {
        if (!landings || settings.landingPagePermissions.length === 0 || !currentUser) return undefined;
        return updateLandings(landings, settings.landingPagePermissions, currentUser);
    }, [settings, landings, currentUser]);

    const saveSettings = useCallback(
        (updatedSettings: Settings) => {
            compositionRoot.settings.save(updatedSettings).run(
                () => updateSettings(updatedSettings),
                error => console.error(error)
            );
        },
        [compositionRoot.settings, updateSettings]
    );

    const updateDefaultApplication = useCallback(
        (value: string) => {
            const updatedSettings = settings.updateDefaultApplication(value);
            return saveSettings(updatedSettings);
        },
        [settings, saveSettings]
    );

    const updateAnalyticsConfig = useCallback(
        async (config: AnalyticsConfig) => {
            const { googleAnalyticsCode, matomoUrl } = settings.analyticsConfig;
            const updatedSettings = settings.updateAnalyticsConfig({
                googleAnalyticsCode:
                    config.googleAnalyticsCode !== undefined ? config.googleAnalyticsCode : googleAnalyticsCode,
                matomoUrl: config.matomoUrl !== undefined ? config.matomoUrl : matomoUrl,
            });

            await compositionRoot.settings
                .save(updatedSettings)
                .runAsync()
                .then(() => updateSettings(updatedSettings));
        },
        [compositionRoot.settings, settings, updateSettings]
    );

    const updateLandingPagePermissions = useCallback(
        async ({ userAccesses, userGroupAccesses, publicAccess: publicAccessValue }: SharedUpdate, id: string) => {
            const existingPermission = settings.landingPagePermissions.find(landing => landing.id === id);

            const hasUsers = Array.isArray(userAccesses);
            const hasUserGroups = Array.isArray(userGroupAccesses);
            const hasPublicAccess = publicAccessValue !== undefined;
            if (!hasUsers && !hasUserGroups && !hasPublicAccess) {
                console.warn("No user, user group, or public access provided.");
                return;
            }

            const mappedUsers = hasUsers ? userAccesses.map(({ id, name }) => ({ id, name })) : undefined;
            const mappedUserGroups = hasUserGroups
                ? userGroupAccesses.map(({ id, name }) => ({ id, name }))
                : undefined;

            const { users = [], userGroups = [], publicAccess = "r-------" } = existingPermission ?? {};
            const updatedPermission: LandingPagePermission = {
                id,
                userGroups: mappedUserGroups ?? userGroups,
                users: mappedUsers ?? users,
                publicAccess: hasPublicAccess ? publicAccessValue : publicAccess,
            };

            const updatedLandingPagePermissions = existingPermission
                ? settings.landingPagePermissions.map(landing => (landing.id === id ? updatedPermission : landing))
                : [...settings.landingPagePermissions, updatedPermission];

            const updatedSettings = settings.updateLandingPagePermissions(updatedLandingPagePermissions);
            return saveSettings(updatedSettings);
        },
        [settings, saveSettings]
    );

    const updateSettingsPermissions = useCallback(
        ({ userAccesses, userGroupAccesses }: SharedUpdate) => {
            const hasUsers = Array.isArray(userAccesses);
            const hasUserGroups = Array.isArray(userGroupAccesses);
            if (!hasUsers && !hasUserGroups) {
                console.warn("No user or user group accesses provided.");
                return;
            }

            const mappedUsers = hasUsers ? userAccesses.map(({ id, name }) => ({ id, name })) : undefined;
            const mappedUserGroups = hasUserGroups
                ? userGroupAccesses.map(({ id, name }) => ({ id, name }))
                : undefined;

            const { users = [], userGroups = [] } = settings.settingsPermissions;
            const updatedSettings = settings.updateSettingsPermissions({
                users: mappedUsers ?? users,
                userGroups: mappedUserGroups ?? userGroups,
            });

            return saveSettings(updatedSettings);
        },
        [settings, saveSettings]
    );

    const updateShowAllActions = useCallback(
        (value: boolean) => {
            const updatedSettings = settings.updateShowAllActions(value);
            return saveSettings(updatedSettings);
        },
        [settings, saveSettings]
    );

    const trackViews = useCallback(
        (event: AnalyticsEvent) => {
            const googleAnalytics = settings.analyticsConfig?.googleAnalyticsCode
                ? new GoogleAnalytics(settings.analyticsConfig.googleAnalyticsCode)
                : undefined;
            const matomoAnalytics = settings.analyticsConfig?.matomoUrl
                ? new MatomoAnalytics(settings.analyticsConfig.matomoUrl)
                : undefined;

            const analyticsTrackers = compact([googleAnalytics, matomoAnalytics]);
            sendAnalyticsEvents({ analyticsTrackers, event });
        },
        [settings]
    );

    const permissionDialogProps: PermissionHandlerProps = useAccessPermissionsDialog({
        permissions: settings.settingsPermissions,
        updatePermissions: updateSettingsPermissions,
        name: i18n.t("Access to settings"),
    });

    return {
        settingPermissionsDialogProps: permissionDialogProps,
        settings: settings,
        user: currentUser,
        userLandings: userLandings,
        trackViews,
        updateAnalyticsConfig,
        updateDefaultApplication,
        updateLandingPagePermissions,
        updateShowAllActions,
    };
}
