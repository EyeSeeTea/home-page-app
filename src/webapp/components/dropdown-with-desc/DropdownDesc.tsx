import { FormControl, Icon, InputLabel, MenuItem, Select, Tooltip } from "@material-ui/core";
import { cyan } from "@material-ui/core/colors";
import React from "react";
import styled from "styled-components";
import { SelectProps } from "@material-ui/core/Select/Select";

export type DropdownDescItem = {
    value: string;
    text: string;
    desc?: string;
};

type DropdownDescProps = {
    label: string;
    value: string;
    options: DropdownDescItem[];
    onChange: (value: string | undefined) => void;
    tooltip?: string;
};

export const DropdownDesc: React.FC<DropdownDescProps> = ({ label, value, options, onChange, tooltip }) => {
    return (
        <StyledFormControl fullWidth hasTooltip={!!tooltip}>
            <StyledInputLabel>
                <LabelContainer>
                    <span>{label}</span>
                    {tooltip && (
                        <Tooltip title={tooltip} placement="right">
                            <StyledIcon>
                                <Icon>help</Icon>
                            </StyledIcon>
                        </Tooltip>
                    )}
                </LabelContainer>
            </StyledInputLabel>
            <Select
                value={value}
                onChange={ev => onChange((ev.target.value as string) || undefined)}
                renderValue={renderValue(options)}
                MenuProps={{
                    getContentAnchorEl: null,
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                }}
            >
                {options.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        <ItemContainer>
                            {option.text}
                            {option.desc && <ItemDescription>{option.desc}</ItemDescription>}
                        </ItemContainer>
                    </MenuItem>
                ))}
            </Select>
        </StyledFormControl>
    );
};

const renderValue =
    (options: DropdownDescItem[]): SelectProps["renderValue"] =>
    value => {
        const option = options.find(opt => opt.value === value);
        return option ? (
            <>
                {option.text} - <ItemDescription>{option.desc}</ItemDescription>
            </>
        ) : (
            ""
        );
    };

const StyledInputLabel = styled(InputLabel)`
    width: 100%;
`;

const LabelContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StyledIcon = styled(Icon)`
    display: flex;
    align-items: center;
`;

const ItemContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ItemDescription = styled.span`
    font-size: 0.75em;
    color: #888;
`;

const StyledFormControl = styled(FormControl)<{ hasTooltip?: boolean }>`
    & .MuiFormLabel-root {
        color: #aaaaaa;
        &.Mui-focused {
            color: #aaaaaa;
        }
        top: -9px !important;
        margin-left: 10px;
        margin-bottom: 8px;
    }

    & .MuiInput-root {
        margin-left: 10px;
    }

    & .MuiInput-formControl {
        min-width: 150px;
        margin-top: ${props => (props.hasTooltip ? "12px" : "8px")} !important;
    }

    & .MuiInput-input {
        color: #565656;
    }

    & .MuiInput-underline {
        &:hover:before {
            border-bottom: 1px solid #bdbdbd;
        }
        &:hover:not(.Mui-disabled):before {
            border-bottom: 1px solid #aaaaaa;
        }
        &:after {
            border-bottom: 2px solid ${cyan["500"]};
        }
        &:before {
            border-bottom: 1px solid #bdbdbd;
        }
    }
`;
