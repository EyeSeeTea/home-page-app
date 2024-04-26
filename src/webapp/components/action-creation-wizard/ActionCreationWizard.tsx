import _ from "lodash";
import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { actionValidations } from "../../../domain/entities/Action";
import { validateModel } from "../../../domain/entities/Validation";
import { useAppContext } from "../../contexts/app-context";
import { ActionCreationWizardStepProps, actionCreationWizardSteps } from "./steps";
import i18n from "../../../locales";

export interface ActionCreationWizardProps extends ActionCreationWizardStepProps {
    className?: string;
}

export const ActionCreationWizard: React.FC<ActionCreationWizardProps> = props => {
    const location = useLocation();
    const { actions } = useAppContext();

    const { className, ...stepProps } = props;
    const { isEdit } = stepProps;

    const steps = useMemo(() => actionCreationWizardSteps.map(step => ({ ...step, props: stepProps })), [stepProps]);

    const isApp = props.action.type === "app";

    const onStepChangeRequest = useCallback(
        async (_currentStep: WizardStep, newStep: WizardStep) => {
            const index = _(steps).findIndex(step => step.key === newStep.key);

            return _.take(steps, index).flatMap(({ validationKeys }) => {
                // If action.type is app, validate keys except launchPageId, as it should be blank; and viceversa for dhisLaunchUrl
                const keys = validationKeys.filter(k => (isApp ? k !== "launchPageId" : k !== "dhisLaunchUrl"));

                const validationErrors = validateModel(props.action, actionValidations, keys).map(
                    ({ description }) => description
                );

                return _.compact([
                    ...validationErrors,
                    // Validate duplicated code for a given module (only on creation)
                    validationKeys.includes("id") && !isEdit && !!actions.find(({ id }) => id === props.action.id)
                        ? i18n.t("Code {{code}} already exists", { code: props.action.id })
                        : undefined,
                ]);
            });
        },
        [props.action, steps, actions, isEdit, isApp]
    );

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <div className={className}>
            <Wizard
                useSnackFeedback={true}
                onStepChangeRequest={onStepChangeRequest}
                initialStepKey={initialStepKey}
                lastClickableStepIndex={steps.length - 1}
                steps={steps}
            />
        </div>
    );
};
