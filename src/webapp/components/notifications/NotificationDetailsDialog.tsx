import { ConfirmationDialog, Sharing } from "@eyeseetea/d2-ui-components";
import { DropdownDesc } from "../dropdown-with-desc/DropdownDesc";
import React from "react";
import styled from "styled-components";

import { NotificationWildcard } from "../../../domain/entities/Notification";
import i18n from "../../../utils/i18n";
import { useNotificationDetailsDialog } from "./useNotificationDetailsDialog";
import { Box, Typography } from "@material-ui/core";
import { NotificationViewModel, wildCardOptions } from "../../models/Notification";
import { MarkdownEditor } from "../markdown-editor/MarkdownEditor";
import { NotificationContent } from "./NotificationContent";

export type NotificationDetailsDialogProps = {
    onClose: () => void;
    onSave: (notification: NotificationViewModel) => Promise<void>;
    initialNotification?: NotificationViewModel;
    isLoading?: boolean;
};

export const NotificationDetailsDialog: React.FC<NotificationDetailsDialogProps> = props => {
    const { onClose, initialNotification, isLoading } = props;
    const title = initialNotification ? i18n.t("Edit Notification") : i18n.t("Create new notification");

    const {
        handleSave,
        notification,
        onContentChange,
        onSharingChanged,
        onWildcardChange,
        searchSharing,
        sharingMeta,
    } = useNotificationDetailsDialog(props);

    return (
        <ConfirmationDialog
            open={true}
            fullWidth={true}
            onCancel={onClose}
            onSave={handleSave}
            title={title}
            maxWidth={"md"}
            disableSave={isLoading}
            saveText={isLoading ? i18n.t("Saving...") : i18n.t("Save")}
        >
            <MarkdownEditor
                value={notification.content.referenceValue}
                onChange={onContentChange}
                markdownPreview={notificationPreview}
                minEditorHeight={350}
            />

            <Row>
                <Typography variant="h6">{i18n.t("Recipients")}</Typography>
            </Row>
            <Row>
                <DropdownDesc
                    label={i18n.t("Wildcard")}
                    options={wildCardOptions()}
                    onChange={onWildcardChange}
                    value={notification.recipients.wildcard}
                    tooltip={i18n.t("Specifies which platform(s) will receive the notification")}
                />
            </Row>

            {notification.recipients.wildcard !== NotificationWildcard.ALL && (
                <Sharing
                    subtitle={i18n.t("Recipient List")}
                    meta={sharingMeta}
                    showOptions={sharingOptions}
                    onSearch={searchSharing}
                    onChange={onSharingChanged}
                />
            )}
        </ConfirmationDialog>
    );
};

const notificationPreview = (markdown: string) => <StyledNotificationContent content={markdown} />;

const sharingOptions = {
    title: false,
    dataSharing: false,
    publicSharing: false,
    externalSharing: false,
    permissionPicker: false,
};

const Row = styled(Box)`
    margin-top: 2em;
`;

const StyledNotificationContent = styled(NotificationContent)`
    height: 400px;
    overflow: auto;
`;
