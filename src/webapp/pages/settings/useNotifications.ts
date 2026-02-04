import { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";

import { useAppContext } from "../../contexts/app-context";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationDetailsDialogProps } from "../../components/notifications/NotificationDetailsDialog";
import i18n from "../../../utils/i18n";
import { getNotificationViewModel, NotificationViewModel } from "../../models/Notification";
import { User } from "../../../domain/entities/User";

function mapViewModelToNotification(
    notificationViewModel: NotificationViewModel[],
    notifications: Notification[],
    user: User
): Notification[] {
    const notificationMap = _.keyBy(notifications, notification => notification.id);
    return notificationViewModel.map(notification => {
        const oldNotif = notificationMap[notification.id];
        return Notification.create({
            id: oldNotif?.id || notification.id,
            content: notification.content,
            recipients: notification.recipients,
            readBy: oldNotif?.readBy || notification.readBy,
            createdAt: notification.createdAt,
            permissions: notification.permissions,
            createdBy: oldNotif?.createdBy || {
                id: user.id,
                name: user.name,
            },
        });
    });
}

export const useNotifications = () => {
    const { compositionRoot, currentUser } = useAppContext();
    const snackbar = useSnackbar();
    const [notifDetailsDialog, setNotifDetailsDialog] = useState<NotificationDetailsDialogProps>();
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const notifications = useMemo(
        () => getNotificationViewModel(allNotifications, currentUser),
        [allNotifications, currentUser]
    );

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const notifications = await compositionRoot.notification.list(currentUser).toPromise();
            setAllNotifications(notifications);
        } catch (err: any) {
            snackbar.error((err && err.message) || err.toString());
        } finally {
            setIsLoading(false);
        }
    }, [compositionRoot, snackbar, currentUser]);

    const saveNotifications = useCallback(
        async (notifications: NotificationViewModel[]) => {
            setIsLoading(true);
            try {
                await compositionRoot.notification
                    .save(mapViewModelToNotification(notifications, allNotifications, currentUser), currentUser)
                    .toPromise();
                setNotifDetailsDialog(undefined);
            } catch (err: any) {
                snackbar.error((err && err.message) || err.toString());
            } finally {
                await fetchNotifications();
            }
        },
        [compositionRoot.notification, fetchNotifications, snackbar, currentUser, allNotifications]
    );

    const onEditNotification = useCallback(
        (notifId: string) => {
            const notification = notifications.find(({ id }) => notifId === id);
            if (!notification) return;

            setNotifDetailsDialog({
                initialNotification: { ...notification },
                onClose: () => setNotifDetailsDialog(undefined),
                onSave: notification => saveNotifications([notification]),
            });
        },
        [notifications, saveNotifications]
    );

    const onNewNotification = useCallback(() => {
        setNotifDetailsDialog({
            onClose: () => setNotifDetailsDialog(undefined),
            onSave: notification => saveNotifications([notification]),
        });
    }, [saveNotifications]);

    const deleteNotifications = useCallback(
        async (notifIds: string[]) => {
            setIsLoading(true);
            const notificationsToDelete = allNotifications.filter(({ id }) => notifIds.includes(id));
            try {
                await compositionRoot.notification.delete(notificationsToDelete).toPromise();
                snackbar.success(i18n.t("Successfully deleted notifications"));
            } catch (err: any) {
                snackbar.error((err && err.message) || err.toString());
            } finally {
                await fetchNotifications();
            }
        },
        [allNotifications, compositionRoot.notification, snackbar, fetchNotifications]
    );

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    //sync notification loading state with dialog props
    useEffect(() => {
        setNotifDetailsDialog(props =>
            props
                ? {
                      ...props,
                      isLoading: isLoading,
                  }
                : undefined
        );
    }, [isLoading]);

    return {
        isNotificationLoading: isLoading,
        notifications,
        notifDetailsDialog,
        onEditNotification,
        onNewNotification,
        deleteNotifications,
        saveNotifications,
        fetchNotifications,
    };
};
