import { Dropdown, MultipleDropdown } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../utils/i18n";
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
import { Button, Switch } from "@material-ui/core";
import { ColorPicker } from "../../color-picker/ColorPicker";

export const GeneralInfoStep: React.FC<ActionCreationWizardStepProps> = ({ action, onChange, isEdit }) => {
    const { compositionRoot, landings } = useAppContext();

    const [errors, setErrors] = useState<Dictionary<string | undefined>>({});

    const onChangeIconLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(action => ({ ...action, iconLocation: event.target.checked ? "bottom" : "top" }));
    };

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
        (text: TranslatableText, value: string, type: "name" | "description") => {
            onChange(action => updateTranslation(action, text.key, value, type));
        },
        [onChange]
    );

    const onChangeDhisVersionRange = useCallback<ComponentParameter<typeof MultipleDropdown, "onChange">>(
        values => {
            onChange(action => ({ ...action, dhisVersionRange: values.join(",") }));
        },
        [onChange]
    );

    const onChangeLandingPage = useCallback<ComponentParameter<typeof Dropdown, "onChange">>(
        value => {
            onChange(action => ({ ...action, launchPageId: value ?? "" }));
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

    const landingPages = React.useMemo(
        () => (landings ?? []).map(landing => ({ value: landing.id, text: landing.name.referenceValue ?? "-" })),
        [landings]
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
                    onChange={event => onChangeTranslation(action.name, event.target.value, "name")}
                    error={!!errors["name"]}
                    helperText={errors["name"]}
                />
            </Row>

            <Row>
                <TextFieldOnBlur
                    fullWidth={true}
                    label={i18n.t("Description")}
                    value={action.description.referenceValue}
                    onChange={event => onChangeTranslation(action.description, event.target.value, "description")}
                    error={!!errors["description"]}
                    helperText={errors["description"]}
                />
            </Row>

            <Row style={{ marginBottom: 40 }}>
                <h3>{i18n.t("Icon")}</h3>

                <IconUpload>
                    {action.icon ? (
                        <IconContainer>
                            <img src={action.icon} alt={`Action icon`} />
                        </IconContainer>
                    ) : null}

                    <FileInput type="file" onChange={handleFileUpload} accept={imagesMimeType} />
                </IconUpload>

                <div>
                    <Label>Icon Location</Label>
                    <IconLocationSwitch>
                        <p>Top</p>
                        <Switch
                            color="primary"
                            checked={!action.iconLocation ? true : action.iconLocation === "bottom"}
                            onChange={onChangeIconLocation}
                            name="iconLocation"
                        />
                        <p>Bottom</p>
                    </IconLocationSwitch>
                </div>
            </Row>

            <Row>
                <h3>{i18n.t("Style")}</h3>

                <ColorSelectorContainer>
                    <p>{i18n.t("Background Color")}</p>
                    <ColorPicker
                        color={action.backgroundColor}
                        onChange={backgroundColor => onChange(action => ({ ...action, backgroundColor }))}
                        width={34}
                        height={36}
                    />
                </ColorSelectorContainer>

                <ColorSelectorContainer>
                    <p>{i18n.t("Font Color")}</p>
                    <ColorPicker
                        color={action.fontColor}
                        onChange={fontColor => onChange(action => ({ ...action, fontColor: fontColor }))}
                        width={34}
                        height={36}
                    />
                </ColorSelectorContainer>

                <OptionContainer>
                    <p>{i18n.t("Text Alignment")}</p>

                    {["left", "center", "right"].map((alignment, i) => (
                        <Button
                            key={i}
                            color={
                                alignment === action.textAlignment || (!action.textAlignment && alignment === "left")
                                    ? "primary"
                                    : "default"
                            }
                            variant="contained"
                            value={alignment}
                            onClick={() => onChange(action => ({ ...action, textAlignment: alignment }))}
                        >
                            {alignment}
                        </Button>
                    ))}
                </OptionContainer>
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
                <h3>{i18n.t("Launch action")}</h3>

                <OptionContainer>
                    <p>{i18n.t("Action type")}</p>

                    {(["app", "page"] as const).map((actionType, i) => (
                        <Button
                            key={i}
                            color={actionType === action.type ? "primary" : "default"}
                            variant="contained"
                            value={actionType}
                            onClick={() => onChange(action => ({ ...action, type: actionType }))}
                        >
                            {actionTypes[actionType]}
                        </Button>
                    ))}
                </OptionContainer>

                {action.type === "app" ? (
                    <TextFieldOnBlur
                        fullWidth={true}
                        label={i18n.t("DHIS2 application *")}
                        value={action.dhisLaunchUrl}
                        onChange={onChangeField("dhisLaunchUrl")}
                        placeholder={"/dhis-web-dashboard/index.html"}
                    />
                ) : (
                    <LandingPageSelector
                        label={i18n.t("Landing page *")}
                        items={landingPages}
                        value={action.launchPageId}
                        onChange={onChangeLandingPage}
                    />
                )}
            </Row>
        </React.Fragment>
    );
};

const actionTypes = {
    app: i18n.t("App/link"),
    page: i18n.t("Landing page"),
} as const;

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

const Label = styled.p`
    margin: 48px 0 0 0;
    font-weight: 300;
`;

const IconLocationSwitch = styled.div`
    display: flex;
    align-items: center;
`;

const ColorSelectorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 50%;
`;

const OptionContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    width: 50%;
    gap: 10px;
    margin-bottom: 20px;
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

const LandingPageSelector = styled(Dropdown)`
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
    { value: "2.39", text: "2.39" },
    { value: "2.40", text: "2.40" },
];
