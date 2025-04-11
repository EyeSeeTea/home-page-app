import { AppContextProviderProps } from "../contexts/app-context";
import { useEffect, useState } from "react";
import { UserNotificationDialogProps } from "../components/user-notification/UserNotificationDialog";

export function useUserNotifications(props: useUserNotificationProps) {
    const { appContextProps } = props;
    const [isUserNotifsLoading, setIsUserNotifsLoading] = useState(true);
    const [userNotificationDialogProps, setUserNotificationDialogProps] = useState<UserNotificationDialogProps | null>(
        null
    );

    const continueLoading = () => {
        setUserNotificationDialogProps(null);
        setIsUserNotifsLoading(false);
    };

    useEffect(() => {
        if (!appContextProps) return;

        const { compositionRoot } = appContextProps;
        async function setupUserNotifs() {
            const notifications = await compositionRoot.notifications.getUserNotifications().toPromise();
            if (notifications.length > 0) {
                setUserNotificationDialogProps({
                    notifications,
                    onClose: () => {
                        continueLoading();
                    },
                    onConfirm: async () => {
                        await compositionRoot.notifications.readUserNotifications(notifications).toPromise();
                        continueLoading();
                    },
                });
            } else {
                continueLoading();
            }
        }
        setupUserNotifs();
    }, [appContextProps]);

    return {
        isUserNotifsLoading: isUserNotifsLoading,
        userNotificationDialogProps: userNotificationDialogProps,
    };
}

type useUserNotificationProps = {
    appContextProps: AppContextProviderProps | null;
};
