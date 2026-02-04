import { useAppContext } from "../../contexts/app-context";
import { useCallback, useState } from "react";
import { NotificationWildcard, Notification } from "../../../domain/entities/Notification";
import { ShareUpdate } from "@eyeseetea/d2-ui-components";
import { NotificationDetailsDialogProps } from "./NotificationDetailsDialog";
import { generateUid } from "../../../data/utils/uid";
import { NamedRef } from "../../../domain/entities/Ref";
import { SharingRule } from "@eyeseetea/d2-ui-components/sharing/types";
import { NotificationViewModel } from "../../models/Notification";

export const useNotificationDetailsDialog = (props: NotificationDetailsDialogProps) => {
    const { onSave, initialNotification } = props;
    const { compositionRoot } = useAppContext();
    const [notification, setNotification] = useState(initialNotification || newNotification());

    const handleSave = useCallback(async () => {
        await onSave(notification);
    }, [notification, onSave]);

    const onContentChange = useCallback((newContent: string) => {
        setNotification(({ content, ...notification }) => ({
            ...notification,
            content: { ...content, referenceValue: newContent, translations: {} },
        }));
    }, []);

    const onSharingChanged = useCallback(async (updatedAttributes: ShareUpdate) => {
        setNotification(notification => {
            const { users, userGroups, wildcard } = notification.recipients;
            const { userAccesses, userGroupAccesses } = updatedAttributes;
            return {
                ...notification,
                recipients: {
                    users: userAccesses ? mapSharingRulesToRecipient(userAccesses) : users,
                    userGroups: userGroupAccesses ? mapSharingRulesToRecipient(userGroupAccesses) : userGroups,
                    wildcard: wildcard,
                },
            };
        });
    }, []);

    const onWildcardChange = useCallback(value => {
        setNotification(notification => ({
            ...notification,
            recipients: {
                ...notification.recipients,
                wildcard: value,
            },
        }));
    }, []);

    const searchSharing = useCallback(
        (query: string) => compositionRoot.instance.searchUsers(query),
        [compositionRoot]
    );

    return {
        handleSave,
        notification,
        onContentChange,
        onSharingChanged,
        onWildcardChange,
        searchSharing,
        sharingMeta: generateSharingMeta(notification),
    };
};

function newNotification(): NotificationViewModel {
    const id = generateUid();
    return {
        id,
        content: Notification.generateTranslatableContent(id, ""),
        recipients: { users: [], userGroups: [], wildcard: NotificationWildcard.BOTH },
        readBy: [],
        createdAt: new Date(),
        permissions: { userAccesses: [], userGroupAccesses: [], publicAccess: "rw------" },
        canEdit: true,
        createdBy: "",
    };
}

const mapRecipientToSharingRules = (recipients: NamedRef[]): SharingRule[] => {
    return recipients.map(({ id, name }) => ({ id, displayName: name, access: "--------" }));
};
const mapSharingRulesToRecipient = (sharingRules: SharingRule[]): NamedRef[] => {
    return sharingRules.map(({ id, displayName }) => ({ id, name: displayName }));
};

const generateSharingMeta = (notification: NotificationViewModel) => ({
    meta: { allowPublicAccess: false, allowExternalAccess: false },
    object: {
        id: "",
        displayName: "",
        userAccesses: mapRecipientToSharingRules(notification.recipients.users),
        userGroupAccesses: mapRecipientToSharingRules(notification.recipients.userGroups),
    },
});
