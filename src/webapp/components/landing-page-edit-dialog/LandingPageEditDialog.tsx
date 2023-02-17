import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    Dropdown,
    MultipleDropdown,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Switch, TextField } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { generateUid } from "../../../data/utils/uid";
import { LandingNode, LandingNodeType } from "../../../domain/entities/LandingNode";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { MarkdownEditor } from "../markdown-editor/MarkdownEditor";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";
import { LandingBody } from "../landing-layout";
import { ColorPicker } from "../color-picker/ColorPicker";
import SwitchBase from "@material-ui/core/internal/SwitchBase";

const buildDefaultNode = (type: LandingNodeType, parent: string, order: number) => {
    return {
        id: generateUid(),
        type,
        parent,
        icon: "",
        iconLocation: "",
        order,
        name: { key: "", referenceValue: "", translations: {} },
        title: undefined,
        content: undefined,
        children: [],
        actions: [],
        backgroundColor: "",
    };
};

export const LandingPageEditDialog: React.FC<LandingPageEditDialogProps> = props => {
    const { type, parent, order, initialNode, onSave } = props;

    const { actions, translate, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [value, setValue] = useState<LandingNode>(initialNode ?? buildDefaultNode(type, parent, order));

    const items = useMemo(
        () =>
            actions
                .filter(({ compatible }) => compatible)
                .map(({ id, name }) => ({ value: id, text: translate(name) })),
        [actions, translate]
    );

    const iconLocations = [
        {
            value: "top",
            text: "Top",
        },
        {
            value: "bottom",
            text: "Bottom",
        },
    ];

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

                <Select
                    label={i18n.t("Icon Location")}
                    items={iconLocations}
                    onChange={iconLocation => iconLocation && setValue(landing => ({ ...landing, iconLocation }))}
                    value={value.iconLocation}
                />

                <Switch color="primary" />
                <SwitchBase checkedIcon={undefined} icon={undefined} />
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

const Select = styled(Dropdown)`
    width: 50%;
`;
