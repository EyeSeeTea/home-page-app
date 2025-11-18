import { NamedRef, SharedProperties } from "./Ref";
import { Struct } from "./generic/Struct";
import { isSuperAdmin, User } from "./User";
import { Either } from "../types/Either";
import { TranslatableText } from "./TranslatableText";
import _ from "lodash";
import i18n from "../../utils/i18n";

export type NotificationAttrs = {
    id: string;
    content: TranslatableText;
    recipients: NotificationRecipients;
    readBy: UserReadNotification[];
    createdAt: Date;
    permissions: SharedProperties;
    createdBy: NamedRef;
};

export class Notification extends Struct<NotificationAttrs>() {
    markAsRead(user: User): Notification {
        if (this.isReadBy(user)) {
            return this;
        } else {
            return this._update({
                readBy: [
                    ...this.readBy,
                    {
                        id: user.id,
                        name: user.name,
                        date: new Date(),
                    },
                ],
            });
        }
    }

    isReadBy(user: User): boolean {
        return this.readBy.some(read => read.id === user.id);
    }

    canView(user: User) {
        return this.checkPermissionAccess(user, "r");
    }

    canEdit(user: User) {
        return this.checkPermissionAccess(user, "rw");
    }

    private checkPermissionAccess(user: User, accessType: "r" | "rw"): boolean {
        if (isSuperAdmin(user) || this.createdBy.id === user.id) return true;

        if (!this.isAllWildcardValid(user)) return false;

        const userPermission = this.permissions.userAccesses.find(permission => permission.id === user.id);

        const groupPermissions = this.permissions.userGroupAccesses.filter(group =>
            user.userGroups.some(userGroup => userGroup.id === group.id)
        );

        return (
            this.hasAccess(this.permissions.publicAccess, accessType) ||
            this.hasAccess(userPermission?.access || "", accessType) ||
            groupPermissions.some(permission => this.hasAccess(permission.access, accessType))
        );
    }

    private hasAccess(accessString: string, accessType: "r" | "rw") {
        return accessString.substring(0, 2).includes(accessType);
    }

    protected validateOrTransform(): Either<Error, this> {
        // createdBy and permissions are new props
        // need to add default values to handle backward compatibility
        // old notifs are only accessible by super admin
        return Either.success(
            this._update({
                createdBy: this.createdBy || { name: "", id: "" },
                permissions: this.permissions || { userAccesses: [], userGroupAccesses: [], publicAccess: "--------" },
            })
        );
    }

    validate(context: { user: User }): Error[] {
        return _([
            !this.isAllWildcardValid(context.user)
                ? new Error(i18n.t("Only super admins can send notifications to all users."))
                : undefined,
            !this.canEdit(context.user)
                ? new Error(i18n.t("User does not have permission to edit this notification."))
                : undefined,
        ])
            .compact()
            .value();
    }

    private isAllWildcardValid(user: User): boolean {
        return this.recipients.wildcard !== NotificationWildcard.ALL || isSuperAdmin(user);
    }

    static generateTranslatableContent(
        id: string,
        content: string,
        translations?: Record<string, string>
    ): TranslatableText {
        return {
            key: id,
            referenceValue: content,
            translations: translations || {},
        };
    }

    static readAllNotifications(notifications: Notification[], user: User): Notification[] {
        return notifications.map(notification => notification.markAsRead(user));
    }
}
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
    ANDROID: "android",
    WEB: "web",
    BOTH: "both",
} as const;

export type NotificationWildcardType = typeof NotificationWildcard[keyof typeof NotificationWildcard];
