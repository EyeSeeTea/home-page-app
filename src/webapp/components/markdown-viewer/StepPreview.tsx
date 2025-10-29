import React from "react";
import { MarkdownViewer } from "./MarkdownViewer";
import styled from "styled-components";
import { LandingBody } from "../landing-layout";

export const StepPreview: React.FC<{
    className?: string;
    value?: string;
    bgColor?: string;
    color?: string;
}> = ({ className, value, bgColor, color }) => {
    if (!value) return null;

    return (
        <StyledLandingBody className={className} bgColor={bgColor}>
            <MarkdownViewer source={value} color={color} replaceVariables={false} />
        </StyledLandingBody>
    );
};

const StyledLandingBody = styled(LandingBody)<{ bgColor?: string }>`
    max-width: 600px;
    border-radius: 18px;
    min-height: unset;
    height: calc(100% - 30px);
    background-color: ${({ bgColor }) => bgColor || "#276696"};
`;
