import React from "react";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { Item, LogoContainer, MarkdownContents } from "../item/Item";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import { LandingContent, LandingTitle } from "../landing-layout";
import { AdditionalComponents } from "../additional-components/AdditionalComponents";

export const ItemRoot: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    logoText: string;
    openPage(page: LandingNode): void;
}> = ({ isRoot, currentPage, logoText, openPage }) => {
    const { translate } = useAppContext();

    return (
        <React.Fragment>
            {(!currentPage.iconLocation || currentPage.iconLocation === "top") && (
                <LogoContainer>
                    <img src={currentPage.icon} alt={logoText} />
                </LogoContainer>
            )}

            <LandingTitle bold={true} big={true}>
                {translate(currentPage.title ?? currentPage.name)}
            </LandingTitle>

            <LandingContent>
                {currentPage.content ? <MarkdownContents source={translate(currentPage.content)} /> : null}

                {currentPage.pageRendering === "single" ? (
                    currentPage.children.map(node => (
                        <Item key={`node-${node.id}`} isRoot={isRoot} openPage={openPage} currentPage={node} />
                    ))
                ) : (
                    <Cardboard rowSize={4} key={`group-${currentPage.id}`}>
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
                            />
                        ))}
                    </Cardboard>
                )}

                <AdditionalComponents currentPage={currentPage} isRoot={isRoot} openPage={openPage} />
            </LandingContent>

            {currentPage.iconLocation === "bottom" && (
                <LogoContainer>
                    <img src={currentPage.icon} alt={logoText} />
                </LogoContainer>
            )}
        </React.Fragment>
    );
};
