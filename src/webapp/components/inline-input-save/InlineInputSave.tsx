import React from "react";
import { Button } from "@material-ui/core";
import { GridForm, SubContainer } from "../../pages/settings/SettingsPage";
import TextFieldOnBlur from "../form/TextFieldOnBlur";

type InlineInputSaveProps = {
    title: string;
    label: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onUpdate: (value: string) => void;
    saveText: string;
};

export const InlineInputSave = (props: InlineInputSaveProps) => {
    const { label, onUpdate, placeholder, saveText, title, value, onChange } = props;

    const handleOnClick = React.useCallback(() => {
        onUpdate(value);
    }, [onUpdate, value]);

    const handleOnChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        },
        [onChange]
    );

    return (
        <SubContainer>
            <h4>{title}</h4>
            <GridForm>
                <TextFieldOnBlur
                    fullWidth={true}
                    label={label}
                    value={value}
                    onChange={handleOnChange}
                    placeholder={placeholder}
                />
                <Button onClick={handleOnClick} color="primary" variant="contained">
                    {saveText}
                </Button>
            </GridForm>
        </SubContainer>
    );
};
