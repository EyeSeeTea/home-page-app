import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { GroupContainer, Header, IconContainer, MarkdownContents } from "../item/Item";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import { LandingTitle, LandingContent } from "../landing-layout";

export const ItemCategory: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    openPage(page: LandingNode): void;
}> = ({ isRoot, currentPage, openPage }) => {
    const { translate } = useAppContext();

    return (
        <GroupContainer>
            <Header>
                {currentPage.icon ? (
                    <IconContainer>
                        <img src={currentPage.icon} alt={`Page icon`} />
                    </IconContainer>
                ) : null}

                <LandingTitle>{translate(currentPage.title ?? currentPage.name)}</LandingTitle>
            </Header>

            <LandingContent>
                {currentPage.content ? <MarkdownContents source={translate(currentPage.content)} /> : null}
                <Cardboard rowSize={5} key={`group-${currentPage.id}`}>
                    {currentPage.children.map((item, idx) => {
                        return (
                            <BigCard
                                key={`card-${idx}`}
                                label={translate(item.name)}
                                onClick={() => openPage(item)}
                                icon={
                                    item.icon ? (
                                        <img src={item.icon} alt={`Icon for ${translate(item.name)}`} />
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </Cardboard>

                <AdditionalComponents currentPage={currentPage} isRoot={isRoot} />
            </LandingContent>
        </GroupContainer>
    );
};
