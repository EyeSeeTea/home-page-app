import { FutureData } from "../types/Future";
import { Notification, NotificationWildcardType } from "../entities/Notification";
import { Maybe } from "../../types/utils";

export interface NotificationRepository {
    list(options: NotificationListOptions): FutureData<Notification[]>;
    save(notifications: Notification[]): FutureData<void>;
}

export type NotificationListOptions = Maybe<{
    wildcard: Maybe<NotificationWildcardType[]>;
}>;
