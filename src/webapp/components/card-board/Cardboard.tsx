import styled from "styled-components";

export const Cardboard = styled.div<{ rowSize?: number }>`
    display: grid;
    grid-template-columns: repeat(${props => props.rowSize ?? 5}, minmax(0, 1fr));
    margin-right: 30px;

    @media only screen and (max-width: 1023px) {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
`;
