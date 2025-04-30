import { useEffect, useState } from "react";

import { AppContextProviderProps } from "../contexts/app-context";
import { UserNotificationDialogProps } from "../components/user-notification/UserNotificationDialog";
import { Notification } from "../../domain/entities/Notification";

export function useUserNotifications(props: useUserNotificationProps) {
    const { appContextProps } = props;
    const [isUserNotifsLoading, setIsUserNotifsLoading] = useState(true);
    const [userNotificationDialogProps, setUserNotificationDialogProps] = useState<UserNotificationDialogProps[]>();

    const continueLoading = () => {
        setUserNotificationDialogProps(undefined);
        setIsUserNotifsLoading(false);
    };

    const closeNotificationDialog = (notification: Notification) => {
        setUserNotificationDialogProps(prevDialogProps => {
            if (!prevDialogProps) return;
            return prevDialogProps.filter(dialog => dialog.notification.id !== notification.id);
        });
    };

    useEffect(() => {
        if (!appContextProps) return;

        const { compositionRoot } = appContextProps;
        async function setupUserNotifs() {
            const notifications = await compositionRoot.notifications.getUserNotifications().toPromise();
            if (notifications.length > 0) {
                setUserNotificationDialogProps(
                    notifications.map(notification => ({
                        notification,
                        onClose: () => {
                            closeNotificationDialog(notification);
                        },
                        onConfirm: async () => {
                            await compositionRoot.notifications.readUserNotifications([notification]).toPromise();
                            closeNotificationDialog(notification);
                        },
                    }))
                );
            } else {
                continueLoading();
            }
        }
        setupUserNotifs();
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

type useUserNotificationProps = {
    appContextProps: AppContextProviderProps | null;
};
