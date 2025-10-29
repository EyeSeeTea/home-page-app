import React, { ChangeEvent } from "react";
import { Maybe } from "../../../types/utils";
import { imagesMimeType } from "../../../utils/files";
import styled from "styled-components";

type IconSelectorProps = {
    icon: string;
    onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    accept?: Maybe<string>;
    alt?: string;
    backgroundColor?: string;
};

export const IconSelector = (props: IconSelectorProps) => {
    const { icon, onUpload, onClear, alt, backgroundColor } = props;
    return (
        <IconUpload>
            {icon ? (
                <IconContainer backgroundColor={backgroundColor}>
                    <img src={icon} alt={alt} />
                    <ClearButton onClick={onClear}>✕</ClearButton>
                </IconContainer>
            ) : null}

            <FileInput type="file" onChange={onUpload} accept={imagesMimeType} />
        </IconUpload>
    );
};

const IconUpload = styled.div`
    display: flex;
    align-items: center;
`;

const IconContainer = styled.div<{ backgroundColor?: string }>`
    padding: 8px;
    border-radius: 4px;
    position: relative;
    margin-right: 60px;
    flex-shrink: 0;
    background-color: ${({ backgroundColor }) => backgroundColor};

    min-width: 150px;

    img {
        user-drag: none;
        width: 100%;
        height: auto;
        max-width: 150px;
        max-height: 150px;
        object-fit: contain;
    }
`;

const ClearButton = styled.button`
    position: absolute;
    top: -13px;
    right: -13px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 14px;
    line-height: 18px;
    text-align: center;
    cursor: pointer;
    padding: 0;

    &:hover {
        background: rgba(0, 0, 0, 0.8);
    }
`;

const FileInput = styled.input`
    outline: none;
`;
