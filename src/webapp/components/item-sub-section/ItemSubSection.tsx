import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { GroupContainer, GroupTitle, MarkdownContents } from "../item/Item";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";

export const ItemSubSection: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    openPage(page: LandingNode): void;
    showAdditionalComponents?: boolean;
}> = ({ isRoot, currentPage, openPage, showAdditionalComponents }) => {
    const { translate } = useAppContext();

    return (
        <GroupContainer>
            <GroupTitle>{translate(currentPage.title ?? currentPage.name)}</GroupTitle>

            {currentPage.content ? <MarkdownContents source={translate(currentPage.content)} /> : null}

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
