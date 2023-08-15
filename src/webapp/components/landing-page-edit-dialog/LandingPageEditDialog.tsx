import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    MultipleDropdown,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Switch, TextField } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { generateUid } from "../../../data/utils/uid";
import { LandingNode, LandingNodePageRendering, LandingNodeType } from "../../../domain/entities/LandingNode";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { MarkdownEditor } from "../markdown-editor/MarkdownEditor";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";
import { LandingBody } from "../landing-layout";
import { ColorPicker } from "../color-picker/ColorPicker";

const buildDefaultNode = (
    type: LandingNodeType,
    parent: string,
    order: number,
    pageRendering: LandingNodePageRendering
) => {
    return {
        id: generateUid(),
        type,
        parent,
        icon: "",
        iconLocation: "",
        pageRendering,
        order,
        name: { key: "", referenceValue: "", translations: {} },
        title: undefined,
        content: undefined,
        children: [],
        actions: [],
        backgroundColor: "",
        secondary: false,
    };
};

export const LandingPageEditDialog: React.FC<LandingPageEditDialogProps> = props => {
    const { type, parent, order, initialNode, onSave } = props;

    const { actions, translate, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [value, setValue] = useState<LandingNode>(initialNode ?? buildDefaultNode(type, parent, order, "multiple"));
    const [iconLocation, setIconLocation] = React.useState(value.iconLocation === "bottom");
    const [pageRendering, setPageRendering] = React.useState(value.pageRendering === "single");

    const items = useMemo(
        () =>
            actions
                .filter(({ compatible }) => compatible)
                .map(({ id, name }) => ({ value: id, text: translate(name) })),
        [actions, translate]
    );

    const save = useCallback(() => {
        if (!value.name.referenceValue) {
            snackbar.error(i18n.t("Field name is mandatory"));
            return;
        }

        onSave({
            ...value,
            name: { ...value.name, key: `${value.id}-name` },
            title: value.title ? { ...value.title, key: `${value.id}-title` } : undefined,
            content: value.content ? { ...value.content, key: `${value.id}-content` } : undefined,
        });
    }, [value, onSave, snackbar]);

    const onChangeField = useCallback((field: keyof LandingNode) => {
        return (event: React.ChangeEvent<{ value: unknown }>) => {
            switch (field) {
                case "name":
                case "title": {
                    const referenceValue = event.target.value as string;
                    setValue(node => {
                        return { ...node, [field]: { key: "name", referenceValue, translations: {} } };
                    });
                    return;
                }
            }
        };
    }, []);

    const onChangeIconLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIconLocation(event.target.checked);
        setValue(value => ({ ...value, iconLocation: event.target.checked ? "bottom" : "top" }));
    };

    const onChangeSecondary = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(value => ({ ...value, secondary: event.target.checked }));
    };

    const onChangePageRendering = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPageRendering(event.target.checked);
        setValue(value => ({ ...value, pageRendering: event.target.checked ? "single" : "multiple" }));
    };

    const handleFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files ? event.target.files[0] : undefined;
            file?.arrayBuffer().then(async data => {
                const icon = await compositionRoot.instance.uploadFile(data, file.name);
                setValue(node => ({ ...node, icon }));
            });
        },
        [compositionRoot]
    );

    return (
        <ConfirmationDialog fullWidth={true} {...props} maxWidth={"md"} onSave={save}>
            <Row>
                <TextField
                    disabled={true}
                    fullWidth={true}
                    label={i18n.t("Identifier")}
                    value={value.id}
                    onChange={onChangeField("id")}
                />
            </Row>

            <Row>
                <TextField
                    fullWidth={true}
                    label={i18n.t("Name *")}
                    value={value.name.referenceValue}
                    onChange={onChangeField("name")}
                />
            </Row>

            <Row>
                <TextField
                    fullWidth={true}
                    label={i18n.t("Title")}
                    value={value.title?.referenceValue ?? ""}
                    onChange={onChangeField("title")}
                />
            </Row>

            {type === "section" && (
                <Row style={{ marginBottom: 40 }}>
                    <h3
                        title={i18n.t(
                            "If only one action in primary sections is visible for a user, an automatic redirect to that section URL will be performed."
                        )}
                    >
                        {i18n.t("Section visibility mode")}
                    </h3>

                    <div>
                        <IconLocationSwitch>
                            <p>{i18n.t("Primary")}</p>
                            <Switch
                                color="primary"
                                checked={Boolean(value.secondary)}
                                onChange={onChangeSecondary}
                                name="secondary"
                            />
                            <p>{i18n.t("Secondary")}</p>
                        </IconLocationSwitch>
                    </div>
                </Row>
            )}

            <Row>
                <h3>{i18n.t("Icon")}</h3>

                <IconUpload>
                    {value.icon ? (
                        <IconContainer>
                            <img src={value.icon} alt={`Page icon`} />
                        </IconContainer>
                    ) : null}

                    <FileInput type="file" onChange={handleFileUpload} />
                </IconUpload>

                <div>
                    <Label>{i18n.t("Icon Location")}</Label>
                    <IconLocationSwitch>
                        <p>{i18n.t("Top")}</p>
                        <Switch
                            color="primary"
                            checked={iconLocation}
                            onChange={onChangeIconLocation}
                            name="iconLocation"
                        />
                        <p>{i18n.t("Bottom")}</p>
                    </IconLocationSwitch>
                </div>
            </Row>

            {type === "root" && (
                <Row>
                    <h3>{i18n.t("Style")}</h3>

                    <ColorSelectorContainer>
                        <p>{i18n.t("Background Color")}</p>
                        <ColorPicker
                            color={value.backgroundColor}
                            onChange={backgroundColor => setValue(landing => ({ ...landing, backgroundColor }))}
                            width={34}
                            height={36}
                        />
                    </ColorSelectorContainer>

                    <div>
                        <Label>{i18n.t("Page Rendering")}</Label>
                        <IconLocationSwitch>
                            <p>{i18n.t("Multiple Page")}</p>
                            <Switch
                                color="primary"
                                checked={pageRendering}
                                onChange={onChangePageRendering}
                                name="pageRendering"
                            />
                            <p>{i18n.t("Single page")}</p>
                        </IconLocationSwitch>
                    </div>
                </Row>
            )}

            <Row>
                <h3>{i18n.t("Actions")}</h3>

                <ActionSelector
                    label={i18n.t("Actions assigned")}
                    items={items}
                    values={value.actions}
                    onChange={actions => setValue(landing => ({ ...landing, actions }))}
                />
            </Row>

            <Row>
                <h3>{i18n.t("Contents")}</h3>

                <MarkdownEditor
                    value={value.content?.referenceValue ?? ""}
                    onChange={referenceValue =>
                        setValue(landing => ({
                            ...landing,
                            content: { key: `${value.id}-content`, referenceValue, translations: {} },
                        }))
                    }
                    markdownPreview={markdown => <StepPreview value={markdown} />}
                    onUpload={(data, file) => compositionRoot.instance.uploadFile(data, file.name)}
                />
            </Row>
        </ConfirmationDialog>
    );
};

export interface LandingPageEditDialogProps extends Omit<ConfirmationDialogProps, "onSave"> {
    initialNode?: LandingNode;
    type: LandingNodeType;
    parent: string;
    order: number;
    onSave: (value: LandingNode) => void;
}

const Row = styled.div`
    margin-bottom: 25px;
`;

const IconContainer = styled.div`
    margin-right: 60px;
    flex-shrink: 0;
    height: 100%;
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

const Label = styled.p`
    margin: 30px 0 0 0;
    font-weight: 300;
`;

const IconLocationSwitch = styled.div`
    display: flex;
    align-items: center;
`;

const FileInput = styled.input`
    outline: none;
`;

const ColorSelectorContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 25%;
`;

const StyledLandingBody = styled(LandingBody)`
    max-width: 600px;
`;

const StepPreview: React.FC<{
    className?: string;
    value?: string;
}> = ({ className, value }) => {
    if (!value) return null;

    return (
        <StyledLandingBody className={className}>
            <MarkdownViewer source={value} center={true} />
        </StyledLandingBody>
    );
};

const ActionSelector = styled(MultipleDropdown)`
    width: 100%;
`;
