import { WizardStep } from "@eyeseetea/d2-ui-components";
import { PartialAction, actionValidations } from "../../../../domain/entities/Action";
import i18n from "../../../../utils/i18n";
import { AccessStep } from "./AccessStep";
import { GeneralInfoStep } from "./GeneralInfoStep";
import { SummaryStep } from "./SummaryStep";

export interface ActionCreationWizardStep extends WizardStep {
    validationKeys: string[];
    showOnSyncDialog?: boolean;
    props?: ActionCreationWizardStepProps;
}

export interface ActionCreationWizardStepProps {
    action: PartialAction;
    onChange: (update: PartialAction | ((prev: PartialAction) => PartialAction)) => void;
    onCancel: () => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    isEdit: boolean;
}

export const actionCreationWizardSteps: ActionCreationWizardStep[] = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: actionValidations.map(({ property }) => property),
    },
    {
        key: "access",
        label: i18n.t("Access"),
        component: AccessStep,
        validationKeys: [],
    },
    {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
    },
];
