import React from "react";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { Notification } from "../../../domain/entities/Notification";
import i18n from "../../../utils/i18n";
import { NotificationContent } from "./NotificationContent";
import { useAppContext } from "../../contexts/app-context";

export const UserNotificationDialog: React.FC<UserNotificationDialogProps> = props => {
    const { notification, onClose, onConfirm } = props;
    const { translate } = useAppContext();
    return (
        <ConfirmationDialog
            title={i18n.t("Notification")}
            open={true}
            onCancel={onClose}
            cancelText={i18n.t("Close")}
            saveText={i18n.t("Okay")}
            maxWidth={"md"}
            fullWidth={true}
            onSave={onConfirm}
        >
            <NotificationContent content={translate(notification.content)} />
        </ConfirmationDialog>
    );
};

export interface UserNotificationDialogProps {
    notification: Notification;
    onClose: () => void;
    onConfirm: () => void;
}
