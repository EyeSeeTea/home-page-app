import { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components";

import { SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { NotificationConfig } from "../../../domain/entities/NotificationConfig";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../utils/i18n";
import { useAccessPermissionsDialog } from "./useAccessPermissionsDialog";

type UseNotificationConfigProps = {
    isAdmin: boolean;
};

export const useNotificationConfig = (props: UseNotificationConfigProps) => {
    const { isAdmin } = props;
    const { compositionRoot, currentUser } = useAppContext();
    const snackbar = useSnackbar();

    const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>();
    const [isLoading, setIsLoading] = useState(true);

    const hasNotificationAccess =
        notificationConfig?.permissions.users.some(({ id }) => id === currentUser.id) ||
        notificationConfig?.permissions.userGroups.some(({ id }) =>
            currentUser.userGroups.some(group => group.id === id)
        );

    const fetchNotificationConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const config = await compositionRoot.notification.getConfig().toPromise();
            setNotificationConfig(config);
        } catch (err: any) {
            snackbar.error((err && err.message) || err.toString());
        } finally {
            setIsLoading(false);
        }
    }, [compositionRoot, snackbar]);

    const saveNotificationPermissions = useCallback(
        async ({ userAccesses, userGroupAccesses }: SharedUpdate) => {
            setIsLoading(true);
            try {
                const permissions = {
                    ...(userAccesses && { users: userAccesses.map(({ id, name }) => ({ id, name })) }),
                    ...(userGroupAccesses && {
                        userGroups: userGroupAccesses.map(({ id, name }) => ({ id, name })),
                    }),
                };
                await compositionRoot.notification.saveConfig({ permissions }).toPromise();
            } catch (err: any) {
                snackbar.error((err && err.message) || err.toString());
            } finally {
                await fetchNotificationConfig();
            }
        },
        [compositionRoot.notification, fetchNotificationConfig, snackbar]
    );

    const permissionDialogProps = useAccessPermissionsDialog({
        permissions: notificationConfig?.permissions,
        updatePermissions: saveNotificationPermissions,
        name: i18n.t("Access to notifications"),
    });

    useEffect(() => {
        fetchNotificationConfig();
    }, [fetchNotificationConfig]);

    return {
        notificationConfigLoading: isLoading,
        notificationConfig: notificationConfig,
        notificationPermissionsDialogProps: permissionDialogProps,
        hasNotificationAccess: isAdmin || hasNotificationAccess,
    };
};
