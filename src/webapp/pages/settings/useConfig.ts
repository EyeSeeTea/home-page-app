import { useState, useEffect, useCallback } from "react";
import { Permission } from "../../../domain/entities/Permission";
import { SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";

export function useConfig(): useConfigPloc {
    const { compositionRoot } = useAppContext();
    const [showAllActions, setShowAllActions] = useState(false);
    const [settingsPermissions, setSettingsPermissions] = useState<Permission>();

    useEffect(() => {
        compositionRoot.config.getShowAllActions().then(setShowAllActions);
        compositionRoot.config.getSettingsPermissions().then(setSettingsPermissions);
    }, [compositionRoot]);

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
        showAllActions,
        updateShowAllActions,
        settingsPermissions,
        updateSettingsPermissions,
    };
}

interface useConfigPloc {
    showAllActions: boolean;
    updateShowAllActions: (value: boolean) => void;
    settingsPermissions?: Permission;
    updateSettingsPermissions: (sharedUpdate: SharedUpdate) => Promise<void>;
}
