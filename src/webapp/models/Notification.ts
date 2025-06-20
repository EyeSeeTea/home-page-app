import { Notification, NotificationAttrs, NotificationWildcard } from "../../domain/entities/Notification";
import { User } from "../../domain/entities/User";
import { DropdownDescItem } from "../components/dropdown-with-desc/DropdownDesc";
import i18n from "../../utils/i18n";

export type NotificationViewModel = Omit<NotificationAttrs, "createdBy"> & {
    canEdit: boolean;
    createdBy: string;
};

export function getNotificationViewModel(notifications: Notification[], user: User): NotificationViewModel[] {
    return notifications.map(notification => ({
        id: notification.id,
        content: notification.content,
        recipients: notification.recipients,
        readBy: notification.readBy,
        createdAt: notification.createdAt,
        permissions: notification.permissions,
        canEdit: notification.canEdit(user),
        createdBy: notification.createdBy.name || "",
    }));
}

export function wildCardOptions(): DropdownDescItem[] {
    return [
        {
            value: NotificationWildcard.ALL,
            text: i18n.t("All"),
            desc: i18n.t("Sent to all users, ignoring recipient list"),
        },
        {
            value: NotificationWildcard.WEB,
            text: i18n.t("Web"),
            desc: i18n.t("Sent to web users in the recipient list"),
        },
        {
            value: NotificationWildcard.ANDROID,
            text: i18n.t("Android"),
            desc: i18n.t("Sent to Android users in the recipient list"),
        },
        {
            value: NotificationWildcard.BOTH,
            text: i18n.t("Both"),
            desc: i18n.t("Sent to web and Android users in the recipient list"),
        },
    ];
}
