import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { Notification } from "../../../domain/entities/Notification";
import i18n from "../../../locales";
import { NotificationContent } from "./NotificationContent";

export const UserNotificationDialog: React.FC<UserNotificationDialogProps> = ({
    notifications,
    onClose,
    onConfirm,
}) => {
    const content = notifications.map(({ content }) => content).join("\n\n");

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
            <NotificationContent content={content} />
        </ConfirmationDialog>
    );
};

export interface UserNotificationDialogProps {
    notifications: Notification[];
    onClose: () => void;
    onConfirm: () => void;
}
