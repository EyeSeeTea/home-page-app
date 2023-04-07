import { Popover } from "@material-ui/core";
import styled from "styled-components";
import React, { useState } from "react";
import { ChromePicker, ColorResult } from "react-color";

export interface ColorPickerProps {
    color?: string;
    onChange?: (color: string) => void;
    label?: string;
    width?: string | number;
    height?: string | number;
}

// Returns one color scale based on a code and number of classes
export const ColorPicker = ({ color, onChange = () => {}, label, width = "100%", height = 30 }: ColorPickerProps) => {
    const [anchor, setAnchor] = useState<Element | null>(null);

    const handleOpen = (event: React.MouseEvent) => setAnchor(event.currentTarget);
    const handleClose = () => setAnchor(null);

    const handleChange = (color: ColorResult) => {
        onChange(color.hex.toUpperCase());
    };

    return (
        <Root>
            {label && <ColorPickerLabel>{label}</ColorPickerLabel>}
            <ColorPickerButton
                onClick={handleOpen}
                style={{
                    background: color,
                    width,
                    height,
                }}
            />
            <Popover open={!!anchor} onClose={handleClose} anchorEl={anchor}>
                <ChromePicker color={color} onChange={handleChange} disableAlpha={true} />
            </Popover>
        </Root>
    );
};

const Root = styled.div`
    margin: 0;
    margin-top: 16px;
    margin-bottom: 16px;
`;

const ColorPickerButton = styled.button`
    padding: 0;
    text-align: right;
    border-radius: 0;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12);
    border: 0;
    cursor: "pointer";
`;

const ColorPickerLabel = styled.div`
    color: #494949;
    font-size: 14px;
    padding-bottom: 6px;
`;
