import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    ObjectsTable,
    TableAction,
    TableColumn,
    TableGlobalAction,
} from "@eyeseetea/d2-ui-components";
import { Icon } from "@material-ui/core";
import { ImportTranslationDialog, ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import i18n from "../../../utils/i18n";
import { NotificationContent } from "./NotificationContent";
import { allWildCardOptionInfo, NotificationViewModel } from "../../models/Notification";
import { PermissionsDialog, PermissionsDialogProps } from "../permissions-dialog/PermissionsDialog";
import moment from "moment/moment";
import { NotificationWildcard } from "../../../domain/entities/Notification";
import { SetMethod } from "../../models/helpers";
import { useImportExportNotificationTranslation } from "./useImportExportNotificationTranslation";

type NotificationListTableProps = {
    notifications: NotificationViewModel[];
    onEditNotification: (notifId: string) => void;
    deleteNotifications: (notifIds: string[]) => Promise<void>;
    saveNotifications: (notifications: NotificationViewModel[]) => Promise<void>;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
};

export const NotificationListTable: React.FC<NotificationListTableProps> = props => {
    const { notifications, onEditNotification, deleteNotifications, saveNotifications, isLoading, fetchNotifications } =
        props;
    const translationImportRef = useRef<ImportTranslationRef>(null);
    const { handleTranslationUpload, exportTranslations } = useImportExportNotificationTranslation(fetchNotifications);

    const [confirmDeleteProps, setConfirmDeleteProps] = useState<ConfirmationDialogProps>();
    const [permissionNotificationId, setPermissionNotificationId] = useState<string>();

    const permissionsDialogProps: PermissionsDialogProps | undefined = useMemo(() => {
        const notification = notifications.find(item => item.id === permissionNotificationId);
        if (!notification) return undefined;
        return buildPermissionsDialogProps({ notification, saveNotifications, setPermissionNotificationId });
    }, [notifications, permissionNotificationId, saveNotifications]);

    const rowConfig = useCallback((row: NotificationViewModel) => {
        return {
            selectable: row.canEdit,
        };
    }, []);

    const globalActions = useMemo(
        () => buildGlobalActions({ translationImportRef, exportTranslations }),
        [translationImportRef, exportTranslations]
    );

    const actions: TableAction<NotificationViewModel>[] = useMemo(
        () =>
            buildTableActions({
                deleteNotifications,
                onEditNotification,
                setConfirmDeleteProps,
                setPermissionNotificationId,
                exportTranslations,
            }),
        [onEditNotification, deleteNotifications, exportTranslations]
    );

    return (
        <PageWrapper>
            {confirmDeleteProps && <ConfirmationDialog {...confirmDeleteProps} />}
            {permissionsDialogProps && <PermissionsDialog {...permissionsDialogProps} />}
            <ImportTranslationDialog type="notification" ref={translationImportRef} onSave={handleTranslationUpload} />
            <ObjectsTable<NotificationViewModel>
                rows={notifications}
                columns={columns}
                actions={actions}
                loading={isLoading}
                rowConfig={rowConfig}
                globalActions={globalActions}
            />
        </PageWrapper>
    );
};

type BuildGlobalActionsProps = {
    translationImportRef: React.RefObject<ImportTranslationRef>;
    exportTranslations: (ids: string[]) => Promise<void>;
};

function buildGlobalActions(props: BuildGlobalActionsProps): TableGlobalAction[] {
    const { translationImportRef, exportTranslations } = props;
    return [
        {
            name: "import-translations",
            text: i18n.t("Import JSON translations"),
            icon: <Icon>translate</Icon>,
            onClick: () => {
                translationImportRef.current?.startImport();
            },
        },
        {
            name: "export-translations",
            text: i18n.t("Export JSON translations"),
            icon: <Icon>translate</Icon>,
            onClick: async (ids: string[]) => {
                await exportTranslations(ids);
            },
            multiple: false,
        },
    ];
}

type BuildPermissionProps = Pick<NotificationListTableProps, "saveNotifications"> & {
    notification: NotificationViewModel;
    setPermissionNotificationId: SetMethod<string | undefined>;
};
function buildPermissionsDialogProps(props: BuildPermissionProps): PermissionsDialogProps {
    const { notification, saveNotifications, setPermissionNotificationId } = props;
    return {
        object: {
            name: i18n.t(""),
            ...notification.permissions,
        },
        showOptions: {
            publicSharing: true,
            permissionPicker: true,
        },
        onChange: async ({ userAccesses, userGroupAccesses, publicAccess }) => {
            const updatedNotification = {
                ...notification,
                permissions: {
                    userAccesses: userAccesses || notification.permissions.userAccesses,
                    userGroupAccesses: userGroupAccesses || notification.permissions.userGroupAccesses,
                    publicAccess: publicAccess || notification.permissions.publicAccess,
                },
            };
            await saveNotifications([updatedNotification]);
        },
        onClose: () => setPermissionNotificationId(undefined),
    };
}

type BuildTableActionProps = Pick<NotificationListTableProps, "deleteNotifications" | "onEditNotification"> & {
    setConfirmDeleteProps: SetMethod<ConfirmationDialogProps | undefined>;
    setPermissionNotificationId: SetMethod<string | undefined>;
    exportTranslations: (ids: string[]) => Promise<void>;
};
function buildTableActions(props: BuildTableActionProps): TableAction<NotificationViewModel>[] {
    const {
        onEditNotification,
        deleteNotifications,
        setConfirmDeleteProps,
        setPermissionNotificationId,
        exportTranslations,
    } = props;
    return [
        {
            name: "edit",
            text: i18n.t("Edit"),
            icon: <Icon>edit</Icon>,
            onClick: ids => {
                const id = ids[0];
                if (id) {
                    onEditNotification(id);
                }
            },
            isActive: rows => rows[0]?.canEdit || false,
        },
        {
            name: "sharing",
            text: i18n.t("Sharing settings"),
            icon: <Icon>share</Icon>,
            onClick: ids => {
                const id = ids[0];
                if (id) {
                    setPermissionNotificationId(id);
                }
            },
            isActive: rows => rows[0]?.canEdit || false,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            icon: <Icon>delete</Icon>,
            multiple: true,
            onClick: ids => {
                setConfirmDeleteProps({
                    isOpen: true,
                    title: i18n.t("Delete notification"),
                    description: i18n.t("Are you sure you want to delete the selected notifications?"),
                    onCancel: () => setConfirmDeleteProps(undefined),
                    onSave: async () => {
                        setConfirmDeleteProps(undefined);
                        await deleteNotifications(ids);
                    },
                    saveText: i18n.t("Delete"),
                    cancelText: i18n.t("Cancel"),
                });
            },
            isActive: rows => {
                return rows.every(notification => notification.canEdit);
            },
        },
        {
            name: "export-translations",
            text: i18n.t("Export JSON translation"),
            icon: <Icon>translate</Icon>,
            multiple: true,
            onClick: async (ids: string[]) => {
                await exportTranslations(ids);
            },
        },
    ];
}

const columns: TableColumn<NotificationViewModel>[] = [
    {
        name: "content",
        text: i18n.t("Content"),
        getValue: item => <NotificationContent content={item.content.referenceValue} />,
    },
    {
        name: "recipients",
        text: i18n.t("Recipients"),
        getValue: item => {
            const isWildcardAll = item.recipients.wildcard === NotificationWildcard.ALL;
            return (
                <>
                    {!isWildcardAll && (
                        <p>
                            {[...item.recipients.users, ...item.recipients.userGroups]
                                .map(item => item.name ?? item.id)
                                .join(", ")}
                        </p>
                    )}
                    <p>
                        {allWildCardOptionInfo().find(wildCard => wildCard.value === item.recipients.wildcard)?.text ||
                            item.recipients.wildcard}
                    </p>
                </>
            );
        },
    },
    {
        name: "createdAt",
        text: i18n.t("Created"),
        getValue: item => (
            <>
                <p>{item.createdBy}</p>
                <p>{moment(item.createdAt).format("YYYY-MM-DD HH:mm")}</p>
            </>
        ),
    },
    {
        name: "readBy",
        text: i18n.t("Read by"),
        getValue: item => item.readBy.map(item => item.name ?? item.id).join(", "),
    },
];

const PageWrapper = styled.div`
    .MuiTableRow-root {
        background: white;
    }
`;
