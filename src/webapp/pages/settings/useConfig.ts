import { useState, useEffect, useCallback } from "react";
import { Permission } from "../../../domain/entities/Permission";
import { SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";
import { LandingPagePermission } from "../../../data/entities/PersistedConfig";
import { User } from "../../../domain/entities/User";

export function useConfig(): useConfigPloc {
    const { compositionRoot } = useAppContext();
    const [showAllActions, setShowAllActions] = useState(false);
    const [defaultApplication, setDefaultApplication] = useState<string>("");
    const [settingsPermissions, setSettingsPermissions] = useState<Permission>();
    const [landingPagePermissions, setLandingPagePermissions] = useState<LandingPagePermission[]>();
    const [user, setUser] = useState<User>();

    useEffect(() => {
        compositionRoot.config.getShowAllActions().then(setShowAllActions);
        compositionRoot.config.getDefaultApplication().then(setDefaultApplication);
        compositionRoot.config.getSettingsPermissions().then(setSettingsPermissions);
        compositionRoot.config.getLandingPagePermissions().then(setLandingPagePermissions);
        compositionRoot.config.getUser().then(setUser);
    }, [compositionRoot]);

    const updateDefaultApplication = useCallback(
        async (value: string) => {
            setDefaultApplication(value);
            compositionRoot.config.updateDefaultApplication(value);
        },
        [compositionRoot]
    );

    const updateLandingPagePermissions = useCallback(
        async ({ userAccesses, userGroupAccesses }: SharedUpdate, id: string) => {
            await compositionRoot.config.updateLandingPagePermissions(
                {
                    users: userAccesses?.map(({ id, name }) => ({ id, name })),
                    userGroups: userGroupAccesses?.map(({ id, name }) => ({ id, name })),
                },
                id
            );

            const newSettings = await compositionRoot.config.getLandingPagePermissions();
            setLandingPagePermissions(newSettings);
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
            compositionRoot.config.setShowAllActions(value);
        },
        [compositionRoot]
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
}
