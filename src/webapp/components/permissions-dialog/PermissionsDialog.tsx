import { ConfirmationDialog, ShareUpdate, Sharing, SharingRule } from "@eyeseetea/d2-ui-components";
import React, { useCallback } from "react";
import { SharedProperties, SharingSetting } from "../../../domain/entities/Ref";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";

export type SharedUpdate = Partial<Pick<SharedProperties, "userAccesses" | "userGroupAccesses" | "publicAccess">>;
export type PermissionsObject = Required<SharedUpdate> & { name: string };
export type SharingShowOptions = {
    dataSharing: boolean;
    publicSharing: boolean;
    externalSharing: boolean;
    permissionPicker: boolean;
};

export type PermissionsDialogProps = {
    object: PermissionsObject;
    onChange: (sharedUpdate: SharedUpdate) => void;
    allowPublicAccess?: boolean;
    allowExternalAccess?: boolean;
    onClose: () => void;
    showOptions?: Partial<SharingShowOptions>;
};

export type PermissionHandlerProps = Pick<PermissionsDialogProps, "object" | "onChange">;

export const PermissionsDialog: React.FC<PermissionsDialogProps> = props => {
    const { object, allowPublicAccess, allowExternalAccess, onClose, onChange, showOptions } = props;

    const { compositionRoot } = useAppContext();
    const search = (query: string) => compositionRoot.instance.searchUsers(query);

    const metaObject = {
        meta: { allowPublicAccess, allowExternalAccess },
        object: {
            id: "",
            displayName: object.name,
            publicAccess: object.publicAccess,
            userAccesses: mapSharingRules(object.userAccesses),
            userGroupAccesses: mapSharingRules(object.userGroupAccesses),
        },
    };

    const showOptionsProp = {
        ...defaultShowOptions,
        ...showOptions,
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
                showOptions={showOptionsProp}
                onSearch={search}
                onChange={onUpdateSharingOptions}
            />
        </ConfirmationDialog>
    );
};
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

const defaultShowOptions: SharingShowOptions = {
    dataSharing: false,
    publicSharing: false,
    externalSharing: false,
    permissionPicker: false,
};
