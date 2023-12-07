import React, { ReactNode } from "react";
import styled from "styled-components";
import { CardTitleIcon } from "./CardTitleIcon";
import { CardProgress, CardProgressText } from "./CardProgress";

const BaseCard: React.FC<BigCardProps> = ({
    className,
    label,
    description,
    icon,
    iconLocation,
    backgroundColor,
    fontColor,
    textAlignment,
    progress,
    onClick,
    onContextMenu,
    disabled,
}) => {
    const normalizedProgress = normalizeProgress(progress);

    return (
        <div
            style={{
                backgroundColor: backgroundColor ?? "#6d98b8",
                color: fontColor ?? "#fff",
                textAlign: textAlignment ?? "left",
            }}
            className={className}
            onClick={disabled ? undefined : onClick}
            onContextMenu={onContextMenu}
        >
            {progress && progress >= 100 ? <CardTitleIcon>done</CardTitleIcon> : null}
            {icon && iconLocation === "top" ? <BigCardIcon>{icon}</BigCardIcon> : null}
            <BigCardTitle>{label}</BigCardTitle>
            {icon && (!iconLocation || iconLocation === "bottom") ? <BigCardIcon>{icon}</BigCardIcon> : null}
            {description ? <p>{description}</p> : null}
            {progress !== undefined ? <CardProgressText>{`${normalizedProgress}%`}</CardProgressText> : null}
            {progress !== undefined ? <CardProgress value={normalizedProgress} max="100"></CardProgress> : null}
        </div>
    );
};

export const BigCard = styled(BaseCard)`
    padding: 20px;
    border-radius: 8px;
    text-align: left;
    margin: 10px 10px 10px;
    user-select: none;
    cursor: ${({ onClick, disabled }) => (onClick && !disabled ? "pointer" : "inherit")};
`;

const normalizeProgress = (progress?: number) => {
    if (progress === undefined) return undefined;
    return Math.max(0, Math.min(100, progress));
};

export interface BigCardProps {
    className?: string;
    label: string;
    progress?: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    disabled?: boolean;
    description?: string;
    icon?: ReactNode;
    iconLocation?: string;
    backgroundColor?: string;
    fontColor?: string;
    textAlignment?: any;
}

const BigCardTitle = styled.span`
    min-height: 48px;
    font-size: 22px;
    font-size: 1.2vw;
    font-weight: 700;
    display: block;
`;

const BigCardIcon = styled.span`
    display: flex;
    place-content: center;
    margin: 20px 0px;

    img,
    svg {
        height: 72px;
        max-height: 10vw;
        // max-width: 18vh;
        margin: 0;
        user-drag: none;
    }
`;
