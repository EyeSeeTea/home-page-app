import React from "react";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { Notification } from "../../../domain/entities/Notification";
import i18n from "../../../utils/i18n";
import { NotificationContent } from "./NotificationContent";

export const UserNotificationDialog: React.FC<UserNotificationDialogProps> = props => {
    const { notification, onClose, onConfirm } = props;
    return (
        <ConfirmationDialog
            title={i18n.t("Notifications")}
            open={true}
            onCancel={onClose}
            cancelText={i18n.t("Close")}
            saveText={i18n.t("Okay")}
            maxWidth={"md"}
            fullWidth={true}
            onSave={onConfirm}
        >
            <NotificationContent content={notification.content} />
        </ConfirmationDialog>
    );
};

export interface UserNotificationDialogProps {
    notification: Notification;
    onClose: () => void;
    onConfirm: () => void;
}
