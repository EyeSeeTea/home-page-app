import { ConfirmationDialog, ShareUpdate, Sharing, SharingRule } from "@eyeseetea/d2-ui-components";
import { useCallback } from "react";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { PermissionsDialogProps } from "../permissions-dialog/PermissionsDialog";
import { SharingSetting } from "../../../domain/entities/Ref";

export interface LandingPagePermissionsDialogProps extends PermissionsDialogProps {
    landingPageId: string;
}

export function LandingPagePermissionsDialog(props: LandingPagePermissionsDialogProps) {
    const { compositionRoot } = useAppContext();
    const { allowPublicAccess, allowExternalAccess, landingPageId, onClose, onChange, object } = props;
    const search = (query: string) => compositionRoot.instance.searchUsers(query);

    const metaObject = {
        meta: { allowPublicAccess, allowExternalAccess },
        object: {
            id: landingPageId,
            displayName: object.name,
            externalAccess: false,
            publicAccess: object.publicAccess,
            userAccesses: mapSharingRules(object.userAccesses),
            userGroupAccesses: mapSharingRules(object.userGroupAccesses),
        },
    };

    const onUpdateSharingOptions = useCallback(
        async ({ userAccesses, userGroupAccesses, publicAccess }: ShareUpdate) => {
            await onChange({
                userAccesses: mapSharingSettings(userAccesses),
                userGroupAccesses: mapSharingSettings(userGroupAccesses),
                publicAccess,
            });
        },
        [onChange]
    );

    return (
        <ConfirmationDialog isOpen={true} fullWidth={true} onCancel={onClose} cancelText={i18n.t("Close")}>
            <Sharing
                meta={metaObject}
                showOptions={{
                    dataSharing: false,
                    publicSharing: true,
                    externalSharing: false,
                    permissionPicker: true,
                }}
                onSearch={search}
                onChange={onUpdateSharingOptions}
            />
        </ConfirmationDialog>
    );
}

const mapSharingSettings = (settings?: SharingRule[]): SharingSetting[] | undefined => {
    return settings?.map(item => {
        return { id: item.id, access: item.access, name: item.displayName };
    });
};

const mapSharingRules = (settings?: SharingSetting[]): SharingRule[] | undefined => {
    return settings?.map(item => {
        return { id: item.id, access: item.access, displayName: item.name };
    });
};
