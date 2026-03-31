import React from "react";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { Item, LogoContainer, MarkdownContents } from "../item/Item";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import { LandingContent, LandingTitle } from "../landing-layout";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";
import { useHeaderInfo } from "../../hooks/useHeaderInfo";
import { useItemRoot } from "./useItemRoot";

export const ItemRoot: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    logoText: string;
    openPage(page: LandingNode): void;
}> = ({ isRoot, currentPage, logoText, openPage }) => {
    const { translate } = useAppContext();
    const { title, showHeader } = useHeaderInfo(currentPage);
    const { isSinglePage, landingRowSize, childrenRowSize } = useItemRoot(currentPage);

    return (
        <React.Fragment>
            {showHeader && (
                <>
                    {currentPage.icon && (!currentPage.iconLocation || currentPage.iconLocation === "top") && (
                        <LogoContainer>
                            <img src={currentPage.icon} alt={logoText} />
                        </LogoContainer>
                    )}

                    <LandingTitle bold={true} big={true} color={currentPage.fontColor}>
                        {title}
                    </LandingTitle>
                </>
            )}

            <LandingContent>
                {currentPage.content ? (
                    <MarkdownContents source={translate(currentPage.content)} color={currentPage.fontColor} />
                ) : null}

                {isSinglePage ? (
                    currentPage.children.map(node => (
                        <Item
                            key={`node-${node.id}`}
                            isRoot={isRoot}
                            openPage={openPage}
                            currentPage={node}
                            landingNodeSize={landingRowSize}
                        />
                    ))
                ) : (
                    <Cardboard rowSize={childrenRowSize} key={`group-${currentPage.id}`}>
                        {currentPage.children.map((item, idx) => (
                            <BigCard
                                key={`card-${idx}`}
                                label={translate(item.name)}
                                onClick={() => openPage(item)}
                                icon={
                                    item.icon ? (
                                        <img src={item.icon} alt={`Icon for ${translate(item.name)}`} />
                                    ) : undefined
                                }
                                iconSize={item.iconSize}
                            />
                        ))}
                    </Cardboard>
                )}

                <AdditionalComponents
                    currentPage={currentPage}
                    isRoot={isRoot}
                    openPage={openPage}
                    rowSize={landingRowSize}
                />
            </LandingContent>

            {currentPage.icon && currentPage.iconLocation === "bottom" && (
                <LogoContainer>
                    <img src={currentPage.icon} alt={logoText} />
                </LogoContainer>
            )}
        </React.Fragment>
    );
};
