import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { GroupContainer, MarkdownContents } from "../item/Item";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import styled from "styled-components";
import { useHeaderInfo } from "../../hooks/useHeaderInfo";

export const ItemSubSection: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    openPage(page: LandingNode): void;
    showAdditionalComponents?: boolean;
}> = ({ isRoot, currentPage, openPage, showAdditionalComponents }) => {
    const { translate } = useAppContext();

    const { title } = useHeaderInfo(currentPage);

    return (
        <GroupContainer>
            <GroupTitle color={currentPage.fontColor}>{title}</GroupTitle>

            {currentPage.content ? (
                <MarkdownContents color={currentPage.fontColor} source={translate(currentPage.content)} />
            ) : null}

            <Cardboard rowSize={5} key={`group-${currentPage.id}`}>
                {currentPage.children.map((item, idx) => {
                    return (
                        <BigCard
                            key={`card-${idx}`}
                            label={translate(item.name)}
                            onClick={() => openPage(item)}
                            icon={
                                item.icon ? <img src={item.icon} alt={`Icon for ${translate(item.name)}`} /> : undefined
                            }
                        />
                    );
                })}
            </Cardboard>

            {showAdditionalComponents && (
                <AdditionalComponents currentPage={currentPage} isRoot={isRoot} openPage={openPage} />
            )}
        </GroupContainer>
    );
};

const GroupTitle = styled.span`
    display: block;
    text-align: left;
    font-size: 32px;
    line-height: 47px;
    font-weight: 700;
    color: ${props => (props.color ? props.color : "#FFFFFF")};
`;
