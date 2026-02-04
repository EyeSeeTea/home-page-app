import { NamedRef } from "./Ref";

export type NotificationConfig = {
    permissions: {
        users: NamedRef[];
        userGroups: NamedRef[];
    };
};
