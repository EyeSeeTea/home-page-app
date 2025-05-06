import compact from "lodash/compact";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LandingPagePermission, Permission } from "../../../domain/entities/Permission";
import { SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";
import { User } from "../../../domain/entities/User";
import { Maybe } from "../../../types/utils";
import { LandingNode, updateLandings } from "../../../domain/entities/LandingNode";
import { AnalyticsConfig } from "../../../domain/entities/AnalyticsConfig";
import { GoogleAnalytics } from "../../utils/GoogleAnalytics";
import { MatomoAnalytics } from "../../utils/matomo";
import { AnalyticsEvent, sendAnalyticsEvents, SendAnalyticsEventType } from "../../utils/analytics";

export function useConfig(): useConfigPloc {
    const { compositionRoot, landings } = useAppContext();
    const [showAllActions, setShowAllActions] = useState(false);
    const [defaultApplication, setDefaultApplication] = useState<string>("");
    const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig>();
    const [settingsPermissions, setSettingsPermissions] = useState<Permission>();
    const [landingPagePermissions, setLandingPagePermissions] = useState<LandingPagePermission[]>();
    const [user, setUser] = useState<User>();

    const userLandings = useMemo<LandingNode[] | undefined>(() => {
        if (!(landings && landingPagePermissions && user)) return undefined;
        return updateLandings(landings, landingPagePermissions, user);
    }, [landingPagePermissions, landings, user]);

    useEffect(() => {
        compositionRoot.config.getShowAllActions().then(setShowAllActions);
        compositionRoot.config.getDefaultApplication().then(setDefaultApplication);
        compositionRoot.config.getSettingsPermissions().then(setSettingsPermissions);
        compositionRoot.config.getLandingPagePermissions().then(setLandingPagePermissions);
        compositionRoot.config.getAnalyticsConfig().then(setAnalyticsConfig);
        compositionRoot.config.getUser().then(setUser);
    }, [compositionRoot]);

    const updateDefaultApplication = useCallback(
        async (value: string) => {
            setDefaultApplication(value);
            await compositionRoot.config.updateDefaultApplication(value);
        },
        [compositionRoot]
    );

    const updateAnalyticsConfig = useCallback(
        async (config: AnalyticsConfig) => {
            await compositionRoot.config.saveAnalyticsConfig(config);
        },
        [compositionRoot]
    );

    const updateLandingPagePermissions = useCallback(
        async ({ userAccesses, userGroupAccesses, publicAccess }: SharedUpdate, id: string) => {
            await compositionRoot.config.updateLandingPagePermissions(
                {
                    users: userAccesses?.map(({ id, name }) => ({ id, name })),
                    userGroups: userGroupAccesses?.map(({ id, name }) => ({ id, name })),
                    publicAccess,
                },
                id
            );

            const newLandingPagePermissions = await compositionRoot.config.getLandingPagePermissions();
            setLandingPagePermissions(newLandingPagePermissions);
        },
        [compositionRoot]
    );

    const updateSettingsPermissions = useCallback(
        async ({ userAccesses, userGroupAccesses }: SharedUpdate) => {
            await compositionRoot.config.updateSettingsPermissions({
                users: userAccesses?.map(({ id, name }) => ({ id, name })),
                userGroups: userGroupAccesses?.map(({ id, name }) => ({ id, name })),
            });

            const newSettings = await compositionRoot.config.getSettingsPermissions();
            setSettingsPermissions(newSettings);
        },
        [compositionRoot]
    );

    const updateShowAllActions = useCallback(
        async (value: boolean) => {
            setShowAllActions(value);
            await compositionRoot.config.setShowAllActions(value);
        },
        [compositionRoot]
    );

    const trackViews = useCallback(
        (event: AnalyticsEvent) => {
            const googleAnalytics = analyticsConfig?.googleAnalyticsCode
                ? new GoogleAnalytics(analyticsConfig.googleAnalyticsCode)
                : undefined;
            const matomoAnalytics = analyticsConfig?.matomoUrl
                ? new MatomoAnalytics(analyticsConfig.matomoUrl)
                : undefined;

            const analyticsTrackers = compact([googleAnalytics, matomoAnalytics]);
            sendAnalyticsEvents({ analyticsTrackers, event });
        },
        [analyticsConfig]
    );

    return {
        user,
        showAllActions,
        updateShowAllActions,
        defaultApplication,
        updateDefaultApplication,
        settingsPermissions,
        updateSettingsPermissions,
        landingPagePermissions,
        updateLandingPagePermissions,
        userLandings,
        updateAnalyticsConfig,
        analyticsConfig,
        setAnalyticsConfig,
        trackViews,
    };
}

interface useConfigPloc {
    user?: User;
    showAllActions: boolean;
    updateShowAllActions: (value: boolean) => void;
    defaultApplication: string;
    updateDefaultApplication: (value: string) => void;
    settingsPermissions?: Permission;
    updateSettingsPermissions: (sharedUpdate: SharedUpdate) => Promise<void>;
    landingPagePermissions?: LandingPagePermission[];
    updateLandingPagePermissions: (sharedUpdate: SharedUpdate, id: string) => Promise<void>;
    userLandings: Maybe<LandingNode[]>;
    analyticsConfig: Maybe<AnalyticsConfig>;
    updateAnalyticsConfig: (config: AnalyticsConfig) => Promise<void>;
    setAnalyticsConfig: React.Dispatch<React.SetStateAction<AnalyticsConfig | undefined>>;
    trackViews: SendAnalyticsEventType;
}
