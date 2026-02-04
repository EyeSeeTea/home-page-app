import React, { useState, useRef, useEffect } from "react";
import { Command, TextApi } from "react-mde";
import styled from "styled-components";

import { contentVariables } from "../../utils/contentVariables";

const VariableDropdown: React.FC<{ onClick: (value: string) => void }> = ({ onClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (value: string) => {
        onClick(value);
        setIsOpen(false);
    };

    return (
        <DropdownContainer ref={dropdownRef}>
            <VariableButton type="button" onClick={() => setIsOpen(o => !o)} title="Insert Variable">
                {"{ }"}
            </VariableButton>

            {isOpen && (
                <DropDownPage>
                    {contentVariables.map(({ label, value }) => (
                        <DropdownItem key={value} onClick={() => handleSelect(value)}>
                            {label}
                        </DropdownItem>
                    ))}
                </DropDownPage>
            )}
        </DropdownContainer>
    );
};

export const useInsertVariableCommand = (): Command => {
    const textApiRef = useRef<TextApi | null>(null);

    return {
        icon: () => (
            <VariableDropdown
                onClick={value => {
                    if (textApiRef.current) {
                        textApiRef.current.replaceSelection(value);
                    }
                }}
            />
        ),
        execute: ({ textApi }) => {
            textApiRef.current = textApi;
        },
    };
};

const DropDownPage = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    margin-top: 4px;
`;

const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const VariableButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    font-weight: bold;
`;

const DropdownItem = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f0f0f0;
    }
`;
