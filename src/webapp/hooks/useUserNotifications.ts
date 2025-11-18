import { useEffect, useState } from "react";

import { AppContextProviderProps } from "../contexts/app-context";
import { UserNotificationDialogProps } from "../components/notifications/UserNotificationDialog";
import { Notification } from "../../domain/entities/Notification";
import { SetMethod } from "../models/helpers";

type UseUserNotificationProps = {
    appContextProps: AppContextProviderProps | null;
};

export function useUserNotifications(props: UseUserNotificationProps) {
    const { appContextProps } = props;
    const [isUserNotifsLoading, setIsUserNotifsLoading] = useState(true);
    const [userNotificationDialogProps, setUserNotificationDialogProps] = useState<UserNotificationDialogProps[]>();

    const continueLoading = () => {
        setUserNotificationDialogProps(undefined);
        setIsUserNotifsLoading(false);
    };

    useEffect(() => {
        initializeUserNotifications({
            appContextProps,
            setUserNotificationDialogProps,
            setIsUserNotifsLoading,
            continueLoading,
        });
    }, [appContextProps]);

    useEffect(() => {
        if (userNotificationDialogProps && !userNotificationDialogProps.length) {
            continueLoading();
        }
    }, [userNotificationDialogProps]);

    return {
        isUserNotifsLoading: isUserNotifsLoading,
        userNotificationDialogProps: userNotificationDialogProps,
    };
}

type InitializeUserNotificationsProps = Pick<UseUserNotificationProps, "appContextProps"> & {
    setUserNotificationDialogProps: SetMethod<UserNotificationDialogProps[] | undefined>;
    setIsUserNotifsLoading: SetMethod<boolean>;
    continueLoading: () => void;
};
async function initializeUserNotifications(props: InitializeUserNotificationsProps) {
    const { appContextProps, setUserNotificationDialogProps, continueLoading, setIsUserNotifsLoading } = props;

    if (!appContextProps) return;

    const { compositionRoot, currentUser } = appContextProps;

    const closeNotificationDialog = (notification: Notification) => {
        setUserNotificationDialogProps(prevDialogProps => {
            if (!prevDialogProps) return;
            return prevDialogProps.filter(dialog => dialog.notification.id !== notification.id);
        });
    };

    try {
        const notifications = await compositionRoot.notification.listUserNotifications(currentUser).toPromise();
        setIsUserNotifsLoading(false);

        if (notifications.length > 0) {
            setUserNotificationDialogProps(
                notifications.map(notification => ({
                    notification,
                    onClose: () => {
                        closeNotificationDialog(notification);
                    },
                    onConfirm: async () => {
                        try {
                            await compositionRoot.notification
                                .readUserNotifications([notification], currentUser)
                                .toPromise();
                        } catch (error) {
                            console.error(`Error saving notification: ${error}`);
                        } finally {
                            closeNotificationDialog(notification);
                        }
                    },
                }))
            );
        } else {
            continueLoading();
        }
    } catch {
        continueLoading();
    }
}
