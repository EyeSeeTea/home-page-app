import { Button } from "@material-ui/core";
import React, { useCallback } from "react";
import styled from "styled-components";
import i18n from "../../../../locales";

import { ActionCreationWizardStepProps } from "./index";

export const SummaryStep: React.FC<ActionCreationWizardStepProps> = ({ action, onClose, onSave }) => {
    const saveAction = useCallback(async () => {
        await onSave();
        onClose();
    }, [onClose, onSave]);

    return (
        <Container>
            <Summary>
                <ul>
                    <LiEntry label={i18n.t("Identifier")} value={action.id} />

                    <LiEntry label={i18n.t("Name")} value={action.name.referenceValue} />
                </ul>

                <Button onClick={saveAction} variant="contained">
                    {i18n.t("Save")}
                </Button>
            </Summary>
        </Container>
    );
};

const LiEntry: React.FC<{ label: string; value?: string }> = ({ label, value, children }) => {
    return (
        <li key={label}>
            {label}
            {value || children ? ": " : ""}
            {value}
            {children}
        </li>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Summary = styled.div`
    padding: 10px;
`;
