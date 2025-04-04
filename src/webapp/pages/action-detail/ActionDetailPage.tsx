import { ConfirmationDialog, ConfirmationDialogProps, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { defaultAction, PartialAction } from "../../../domain/entities/Action";
import i18n from "../../../utils/i18n";
import { ActionCreationWizard } from "../../components/action-creation-wizard/ActionCreationWizard";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";
import { DhisLayout } from "../../components/dhis-layout/DhisLayout";
import { useNavigate, useParams } from "react-router-dom";
import { Params } from "@eyeseetea/d2-api/api/common";

export interface ActionDetailPageProps extends Params {
    mode: "new" | "edit" | "clone";
}

const getClonedAction = (action: PartialAction): PartialAction => {
    const id = `${action.id}-copy`;
    const referenceValue = `Copy of ${action.name.referenceValue}`;

    return {
        ...action,
        id,
        name: { key: id, referenceValue, translations: {} },
    };
};

export const ActionDetailPage: React.FC<ActionDetailPageProps> = ({ mode }) => {
    const { compositionRoot, reload } = useAppContext();
    const { id } = useParams();
    const navigate = useNavigate();
    const snackbar = useSnackbar();

    const [stateAction, updateStateAction] = useState<PartialAction>(defaultAction);

    useEffect(() => {
        if (id) {
            compositionRoot.actions.get(id).then(action => {
                if (action) {
                    updateStateAction(mode === "clone" ? getClonedAction(action) : action);
                }
            });
        }
    }, [id, mode, compositionRoot.actions]);

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [dirty, setDirty] = useState<boolean>(false);

    const openSettings = useCallback(() => {
        navigate("/settings");
    }, [navigate]);

    const saveAction = useCallback(async () => {
        await compositionRoot.actions.update({ ...stateAction, id: _.kebabCase(stateAction.id) }).catch(snackbar.error);
        await reload();
    }, [stateAction, compositionRoot, reload, snackbar]);

    const onChange = useCallback((update: Parameters<typeof updateStateAction>[0]) => {
        updateStateAction(update);
        setDirty(true);
    }, []);

    const onCancel = useCallback(() => {
        if (!dirty) {
            openSettings();
            return;
        }

        const dialogTitles = {
            edit: i18n.t("Cancel action editing?"),
            clone: i18n.t("Cancel action cloning?"),
            new: i18n.t("Cancel action creation?"),
        };

        updateDialog({
            title: dialogTitles[mode],
            description: i18n.t("All your changes will be lost. Are you sure you want to proceed?"),
            saveText: i18n.t("Yes"),
            cancelText: i18n.t("No"),
            onSave: openSettings,
            onCancel: () => updateDialog(null),
        });
    }, [dirty, openSettings, mode]);

    const titles = {
        edit: i18n.t("Edit action"),
        clone: i18n.t("Clone action"),
        new: i18n.t("New action"),
    };

    return (
        <DhisLayout>
            <Header title={titles[mode]} onBackClick={onCancel} />

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            {stateAction ? (
                <Wizard
                    isEdit={mode === "edit"}
                    onChange={onChange}
                    onCancel={onCancel}
                    onClose={openSettings}
                    onSave={saveAction}
                    action={stateAction}
                />
            ) : null}
        </DhisLayout>
    );
};

const Header = styled(PageHeader)`
    margin-top: 1rem;
`;

const Wizard = styled(ActionCreationWizard)`
    margin: 1rem;
`;
