import { useState, useEffect, useCallback, useMemo } from "react";
import { LandingPagePermission, Permission } from "../../../domain/entities/Permission";
import { SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";
import { User } from "../../../domain/entities/User";
import { Maybe } from "../../../types/utils";
import { LandingNode, updateLandingNodes } from "../../../domain/entities/LandingNode";

export function useConfig(): useConfigPloc {
    const { compositionRoot, landings } = useAppContext();
    const [showAllActions, setShowAllActions] = useState(false);
    const [defaultApplication, setDefaultApplication] = useState<string>("");
    const [googleAnalyticsCode, setGoogleAnalyticsCode] = useState<Maybe<string>>();
    const [settingsPermissions, setSettingsPermissions] = useState<Permission>();
    const [landingPagePermissions, setLandingPagePermissions] = useState<LandingPagePermission[]>();
    const [user, setUser] = useState<User>();

    const userLandings = useMemo<LandingNode[] | undefined>(() => {
        if (!(landings && landingPagePermissions && user)) return undefined;
        return updateLandingNodes(landings, landingPagePermissions, user);
    }, [landingPagePermissions, landings, user]);

    useEffect(() => {
        compositionRoot.config.getShowAllActions().then(setShowAllActions);
        compositionRoot.config.getDefaultApplication().then(setDefaultApplication);
        compositionRoot.config.getGoogleAnalyticsCode().then(setGoogleAnalyticsCode);
        compositionRoot.config.getSettingsPermissions().then(setSettingsPermissions);
        compositionRoot.config.getLandingPagePermissions().then(setLandingPagePermissions);
        compositionRoot.config.getUser().then(setUser);
    }, [compositionRoot]);

    const updateDefaultApplication = useCallback(
        async (value: string) => {
            setDefaultApplication(value);
            await compositionRoot.config.updateDefaultApplication(value);
        },
        [compositionRoot]
    );

    const updateGoogleAnalyticsCode = useCallback(
        async (code: string) => {
            setGoogleAnalyticsCode(code);
            await compositionRoot.config.updateGoogleAnalyticsCode(code);
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

    return {
        user,
        showAllActions,
        updateShowAllActions,
        defaultApplication,
        updateDefaultApplication,
        updateGoogleAnalyticsCode,
        settingsPermissions,
        updateSettingsPermissions,
        landingPagePermissions,
        updateLandingPagePermissions,
        googleAnalyticsCode,
        userLandings,
    };
}

interface useConfigPloc {
    user?: User;
    showAllActions: boolean;
    updateShowAllActions: (value: boolean) => void;
    defaultApplication: string;
    updateDefaultApplication: (value: string) => void;
    updateGoogleAnalyticsCode: (code: string) => Promise<void>;
    settingsPermissions?: Permission;
    updateSettingsPermissions: (sharedUpdate: SharedUpdate) => Promise<void>;
    landingPagePermissions?: LandingPagePermission[];
    updateLandingPagePermissions: (sharedUpdate: SharedUpdate, id: string) => Promise<void>;
    googleAnalyticsCode: Maybe<string>;
    userLandings: Maybe<LandingNode[]>;
}
