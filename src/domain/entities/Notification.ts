import { NamedRef } from "./Ref";

export type Notification = {
    id: string;
    content: string;
    recipients: NotificationRecipients;
    readBy: UserReadNotification[];
    createdAt: Date;
};

type NotificationRecipients = {
    users: NamedRef[];
    userGroups: NamedRef[];
    wildcard: NotificationWildcardType;
};

type UserReadNotification = {
    id: string;
    name: string;
    date: Date;
};

export const NotificationWildcard = {
    ALL: "ALL",
    ANDROID: "ANDROID",
    WEB: "WEB",
} as const;

export type NotificationWildcardType = keyof typeof NotificationWildcard;
