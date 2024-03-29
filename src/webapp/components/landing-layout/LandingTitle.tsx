import styled from "styled-components";

export const LandingTitle = styled.span<{ big?: boolean; bold?: boolean }>`
    display: block;
    font-weight: ${props => (props.bold ? "bold" : 300)};
    font-size: ${props => (props.big ? "48px" : "36px")};
    line-height: ${props => (props.big ? "60px" : "47px")};
    margin: ${props => (props.big ? "30px" : "0px")} 0px 30px 0px;
`;
