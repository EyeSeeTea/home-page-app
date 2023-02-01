import { MultipleDropdown } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { Dictionary } from "lodash";
import React, { ChangeEvent, useCallback, useState } from "react";
import styled from "styled-components";
import { Action } from "../../../../domain/entities/Action";
import { TranslatableText } from "../../../../domain/entities/TranslatableText";
import { updateTranslation } from "../../../../domain/helpers/ActionHelpers";
import { ComponentParameter } from "../../../../types/utils";
import { imagesMimeType } from "../../../../utils/files";
import { useAppContext } from "../../../contexts/app-context";
import TextFieldOnBlur from "../../form/TextFieldOnBlur";
import { ActionCreationWizardStepProps } from "./index";

export const GeneralInfoStep: React.FC<ActionCreationWizardStepProps> = ({ action, onChange, isEdit }) => {
    const { compositionRoot } = useAppContext();

    const [errors, setErrors] = useState<Dictionary<string | undefined>>({});

    const onChangeField = useCallback(
        (field: keyof Action) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                switch (field) {
                    case "id": {
                        const id = event.target.value as string;
                        onChange(action => {
                            return { ...action, id };
                        });
                        return;
                    }
                    default: {
                        onChange(action => {
                            return { ...action, [field]: event.target.value as string };
                        });
                    }
                }
                setErrors(errors => ({
                    ...errors,
                    // TODO: Add validation from model
                    [field]: !event.target.value ? i18n.t("Field must have a value") : undefined,
                }));
            };
        },
        [onChange]
    );

    const onChangeTranslation = useCallback(
        (text: TranslatableText, value: string) => {
            onChange(action => updateTranslation(action, text.key, value));
        },
        [onChange]
    );

    const onChangeDhisVersionRange = useCallback<ComponentParameter<typeof MultipleDropdown, "onChange">>(
        values => {
            onChange(action => ({ ...action, dhisVersionRange: values.join(",") }));
        },
        [onChange]
    );

    const handleFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files ? event.target.files[0] : undefined;
            file?.arrayBuffer().then(async data => {
                const icon = await compositionRoot.instance.uploadFile(data, file.name);
                onChange(action => ({ ...action, icon }));
            });
        },
        [compositionRoot, onChange]
    );

    return (
        <React.Fragment>
            <Row>
                <TextFieldOnBlur
                    disabled={!!isEdit}
                    fullWidth={true}
                    label={i18n.t("Code *")}
                    value={action.id}
                    onChange={onChangeField("id")}
                    error={!!errors["id"]}
                    helperText={errors["id"]}
                />
            </Row>

            <Row>
                <TextFieldOnBlur
                    fullWidth={true}
                    label={i18n.t("Name *")}
                    value={action.name.referenceValue}
                    onChange={event => onChangeTranslation(action.name, event.target.value)}
                    error={!!errors["name"]}
                    helperText={errors["name"]}
                />
            </Row>

            <Row style={{ marginBottom: 80 }}>
                <h3>{i18n.t("Icon")}</h3>

                <IconUpload>
                    {action.icon ? (
                        <IconContainer>
                            <img src={action.icon} alt={`Action icon`} />
                        </IconContainer>
                    ) : null}

                    <FileInput type="file" onChange={handleFileUpload} accept={imagesMimeType} />
                </IconUpload>
            </Row>

            <Row>
                <h3>{i18n.t("DHIS2 Compatibility")}</h3>

                <DHISVersionSelector
                    label={i18n.t("Compatible versions")}
                    items={dhisVersions}
                    values={action.dhisVersionRange.split(",")}
                    onChange={onChangeDhisVersionRange}
                />
            </Row>

            <Row>
                <h3>{i18n.t("Launch application")}</h3>

                <TextFieldOnBlur
                    fullWidth={true}
                    label={i18n.t("DHIS2 application *")}
                    value={action.dhisLaunchUrl}
                    onChange={onChangeField("dhisLaunchUrl")}
                    placeholder={"/dhis-web-dashboard/index.html"}
                />
            </Row>
        </React.Fragment>
    );
};

const Row = styled.div`
    margin-bottom: 25px;
`;

const IconContainer = styled.div`
    margin-right: 60px;
    flex-shrink: 0;
    height: 12vh;
    width: 12vh;

    img {
        width: 100%;
        height: auto;
        padding: 10px;
        user-drag: none;
    }
`;

const IconUpload = styled.div`
    display: flex;
    align-items: center;
`;

const FileInput = styled.input`
    outline: none;
`;

const DHISVersionSelector = styled(MultipleDropdown)`
    width: 100%;
    margin-left: -10px;
    margin-top: 10px;

    div,
    label {
        color: black;
    }
`;

const dhisVersions = [
    { value: "2.30", text: "2.30" },
    { value: "2.31", text: "2.31" },
    { value: "2.32", text: "2.32" },
    { value: "2.33", text: "2.33" },
    { value: "2.34", text: "2.34" },
    { value: "2.35", text: "2.35" },
    { value: "2.36", text: "2.36" },
    { value: "2.37", text: "2.37" },
    { value: "2.38", text: "2.38" },
];
