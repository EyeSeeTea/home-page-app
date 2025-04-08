import { FutureData } from "../types/Future";
import { Notification, NotificationWildcardType } from "../entities/Notification";
import { Maybe } from "../../types/utils";
import { User } from "../entities/User";

export interface NotificationRepository {
    list(options: NotificationListOptions): FutureData<Notification[]>;
    save(notifications: Partial<Notification>[]): FutureData<void>;
}

export type NotificationListOptions = Maybe<{
    user: User;
    isRead: Maybe<boolean>;
    wildcard: Maybe<NotificationWildcardType[]>;
}>;
