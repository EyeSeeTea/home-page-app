import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    MultipleDropdown,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Button, Switch, TextField } from "@material-ui/core";
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
    pageRendering: LandingNodePageRendering,
    executeOnInit: boolean
) => {
    return {
        id: generateUid(),
        type,
        parent,
        icon: "",
        iconLocation: "",
        iconSize: "",
        favicon: "",
        pageRendering,
        order,
        name: { key: "", referenceValue: "", translations: {} },
        title: undefined,
        content: undefined,
        children: [],
        actions: [],
        backgroundColor: "",
        secondary: false,
        executeOnInit,
    };
};

export const LandingPageEditDialog: React.FC<LandingPageEditDialogProps> = props => {
    const { type, parent, order, initialNode, onSave } = props;

    const { actions, translate, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [value, setValue] = useState<LandingNode>(
        initialNode ?? buildDefaultNode(type, parent, order, "multiple", true)
    );
    const [iconLocation, setIconLocation] = useState(value.iconLocation === "bottom");
    const [pageRendering, setPageRendering] = useState(value.pageRendering === "single");
    const [warnings, setWarnings] = useState<string[]>([]);

    const items = useMemo(
        () =>
            actions
                .filter(({ compatible }) => compatible)
                .filter(({ type, launchPageId }) => type === "app" || (type === "page" && value.id !== launchPageId))
                .map(({ id, name }) => ({ value: id, text: translate(name) })),
        [actions, translate, value.id]
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

    const onChangeExecuteOnInit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(value => ({ ...value, executeOnInit: event.target.checked }));
    };

    const onChangePageRendering = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPageRendering(event.target.checked);
        setValue(value => ({ ...value, pageRendering: event.target.checked ? "single" : "multiple" }));
    };

    const handleFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>, fileType: keyof LandingNode) => {
            const file = event.target.files ? event.target.files[0] : undefined;

            file?.arrayBuffer().then(async data => {
                const reader = new FileReader();
                reader.onload = e => {
                    const img = new Image();
                    img.onload = () => {
                        const width = img.width;
                        const height = img.height;
                        const aspectRatio = width / height;

                        setWarnings([]);
                        const newWarnings: string[] = [];

                        if (fileType === "favicon") {
                            if (aspectRatio !== FAVICON_ASPECT_RATIO) {
                                newWarnings.push("Please ensure that your favicon has a 1:1 aspect ratio.");
                            }

                            if (width > FAVICON_MAX_SIZE || height > FAVICON_MAX_SIZE) {
                                newWarnings.push("Please use an icon of 128x128 pixels or smaller.");
                            }

                            newWarnings.length !== 0 && setWarnings(newWarnings);
                        }
                    };
                    if (e.target?.result) {
                        img.src = e.target.result as string;
                    }
                };
                reader.readAsDataURL(file);
                const icon = await compositionRoot.instance.uploadFile(data, file.name);
                setValue(node => ({ ...node, [fileType]: icon }));
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

                    <FileInput type="file" onChange={event => handleFileUpload(event, "icon")} />
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

                <Label>{i18n.t("Icon Size")}</Label>
                <OptionContainer>
                    {["small", "medium", "large"].map((size, i) => (
                        <Button
                            key={i}
                            color={
                                size === value.iconSize || (!value.iconSize && size === "small") ? "primary" : "default"
                            }
                            variant="contained"
                            value={size}
                            onClick={() => setValue(value => ({ ...value, iconSize: size }))}
                        >
                            {size}
                        </Button>
                    ))}
                </OptionContainer>
            </Row>

            {type === "root" && (
                <Row>
                    <h3>{i18n.t("Favicon")}</h3>

                    <IconUpload>
                        {value.favicon ? (
                            <IconContainer>
                                <img src={value.favicon} alt={`Page favicon`} />
                            </IconContainer>
                        ) : null}

                        <FileInput type="file" onChange={event => handleFileUpload(event, "favicon")} />
                    </IconUpload>

                    {warnings.length > 0 && (
                        <WarningText>
                            {warnings.map(warning => (
                                <p key={warning}>{i18n.t(warning)}</p>
                            ))}
                        </WarningText>
                    )}
                </Row>
            )}

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

                    <div>
                        <Label>{i18n.t("Execute on init")}</Label>
                        <IconLocationSwitch>
                            <p>{i18n.t("Disabled")}</p>
                            <Switch
                                color="primary"
                                checked={Boolean(value.executeOnInit)}
                                onChange={onChangeExecuteOnInit}
                                name="executeOnInit"
                            />
                            <p>{i18n.t("Enabled")}</p>
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

const FAVICON_ASPECT_RATIO = 1;
const FAVICON_MAX_SIZE = 128;

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

const WarningText = styled.p`
    font-size: 12px;
    line-height: 0.1;
    font-style: italic;
    color: red;
`;

const OptionContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    width: 50%;
    gap: 10px;
    margin: 20px 0;
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
