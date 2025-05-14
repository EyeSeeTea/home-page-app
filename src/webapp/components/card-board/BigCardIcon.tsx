import styled from "styled-components";

type BigCardIconProps = {
    iconSize: string | undefined;
};

export const BigCardIcon = styled.span<BigCardIconProps>`
    display: flex;
    place-content: center;
    margin: 20px 0px;
    img,
    svg {
        height: ${props => (props.iconSize ? iconSizeValues[props.iconSize] : iconSizeValues.small)};
        margin: 0;
        user-drag: none;
    }
`;

const iconSizeValues: Record<string, string> = {
    small: "72px",
    medium: "96px",
    large: "136.5px",
};
