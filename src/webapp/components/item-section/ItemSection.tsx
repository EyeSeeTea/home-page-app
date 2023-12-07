import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { GroupContainer, Header, IconContainer, Item, MarkdownContents } from "../item/Item";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";
import { LandingTitle, LandingContent } from "../landing-layout";

export const ItemSection: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    openPage(page: LandingNode): void;
    showAdditionalComponents?: boolean;
}> = ({ isRoot, currentPage, openPage, showAdditionalComponents }) => {
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
                {currentPage.children.map(node => (
                    <Item key={`node-${node.id}`} isRoot={isRoot} openPage={() => openPage(node)} currentPage={node} />
                ))}
                {showAdditionalComponents && <AdditionalComponents currentPage={currentPage} isRoot={isRoot} />}
            </LandingContent>
        </GroupContainer>
    );
};
