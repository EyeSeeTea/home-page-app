import React from "react";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { LogoContainer } from "../item/Item";
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
            <LogoContainer>
                <img src={currentPage.icon} alt={logoText} />
            </LogoContainer>
            <LandingTitle bold={true} big={true}>
                {translate(currentPage.title ?? currentPage.name)}
            </LandingTitle>

            <LandingContent>
                <Cardboard rowSize={4} key={`group-${currentPage.id}`}>
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
        </React.Fragment>
    );
};
