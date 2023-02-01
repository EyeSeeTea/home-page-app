import React from "react";
import styled from "styled-components";
import { LandingHeader, LandingHeaderProps } from "./LandingHeader";

export const LandingLayout: React.FC<LandingPageProps> = ({
    className,
    children,
    onGoHome,
    onGoBack,
    onSettings,
    onAbout,
    onLogout,
    centerChildren,
}) => {
    return (
        <LandingWrapper center={centerChildren}>
            <LandingBody className={className}>
                <LandingHeader
                    onGoHome={onGoHome}
                    onGoBack={onGoBack}
                    onSettings={onSettings}
                    onAbout={onAbout}
                    onLogout={onLogout}
                />
                {children}
            </LandingBody>
        </LandingWrapper>
    );
};

export interface LandingPageProps extends LandingHeaderProps {
    className?: string;
    centerChildren?: boolean;
}

const LandingWrapper = styled.div<{ center?: boolean }>`
    justify-content: center;
    align-items: center;
    text-align: ${props => (props.center ? "center" : "unset")};
    user-select: none;
`;

export const LandingBody = styled.div`
    background-color: #276696;
    padding: 18px;
    font-family: "Roboto", sans-serif;
    color: #fff;
    pointer-events: auto;
`;
