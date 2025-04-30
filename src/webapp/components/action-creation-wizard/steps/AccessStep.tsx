import { ShareUpdate, Sharing, SharingRule } from "@eyeseetea/d2-ui-components";
import React, { useCallback } from "react";
import styled from "styled-components";
import { SharingSetting } from "../../../../domain/entities/Ref";
import i18n from "../../../../utils/i18n";
import { useAppContext } from "../../../contexts/app-context";
import { ActionCreationWizardStepProps } from "./index";

export const AccessStep: React.FC<ActionCreationWizardStepProps> = ({
    action,
    onChange,
}: ActionCreationWizardStepProps) => {
    const { compositionRoot } = useAppContext();

    const search = useCallback((query: string) => compositionRoot.instance.searchUsers(query), [compositionRoot]);

    const setActionSharing = useCallback(
        ({ publicAccess, userAccesses, userGroupAccesses }: ShareUpdate) => {
            onChange(action => {
                return {
                    ...action,
                    publicAccess: publicAccess ?? action.publicAccess,
                    userAccesses: userAccesses ? mapSharingSettings(userAccesses) : action.userAccesses,
                    userGroupAccesses: userGroupAccesses
                        ? mapSharingSettings(userGroupAccesses)
                        : action.userGroupAccesses,
                };
            });
            return Promise.resolve();
        },
        [onChange]
    );

    return (
        <React.Fragment>
            <Sharing
                meta={{
                    meta: { allowPublicAccess: true, allowExternalAccess: false },
                    object: {
                        id: action.id,
                        displayName: action.name.referenceValue,
                        publicAccess: action.publicAccess,
                        userAccesses: mapSharingRules(action.userAccesses),
                        userGroupAccesses: mapSharingRules(action.userGroupAccesses),
                    },
                }}
                showOptions={{
                    title: false,
                    dataSharing: false,
                    publicSharing: true,
                    externalSharing: false,
                    permissionPicker: true,
                }}
                onSearch={search}
                onChange={setActionSharing}
            />

            <Footer>
                {i18n.t("Note: The sharing settings are only applied to the current action", { nsSeparator: false })}
            </Footer>
        </React.Fragment>
    );
};

const Footer = styled.div`
    margin-top: 10px;
    margin-bottom: 15px;
    font-size: 1.1.em;
    text-align: left;
`;

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
