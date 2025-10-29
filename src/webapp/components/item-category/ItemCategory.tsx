import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { GroupContainer, Header, IconContainer, MarkdownContents } from "../item/Item";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import { LandingTitle, LandingContent } from "../landing-layout";
import { useHeaderInfo } from "../../hooks/useHeaderInfo";

export const ItemCategory: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    openPage(page: LandingNode): void;
    showAdditionalComponents?: boolean;
}> = ({ isRoot, currentPage, openPage, showAdditionalComponents }) => {
    const { translate } = useAppContext();

    const { title, showHeader } = useHeaderInfo(currentPage);

    return (
        <GroupContainer>
            {showHeader && (
                <Header>
                    {currentPage.icon ? (
                        <IconContainer>
                            <img src={currentPage.icon} alt={`Page icon`} />
                        </IconContainer>
                    ) : null}

                    {title && <LandingTitle color={currentPage.fontColor}>{title}</LandingTitle>}
                </Header>
            )}

            <LandingContent>
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
                                    item.icon ? (
                                        <img src={item.icon} alt={`Icon for ${translate(item.name)}`} />
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </Cardboard>
                {showAdditionalComponents && (
                    <AdditionalComponents currentPage={currentPage} isRoot={isRoot} openPage={openPage} />
                )}
            </LandingContent>
        </GroupContainer>
    );
};
