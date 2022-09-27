import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { ItemCategory } from "../item-category/ItemCategory";
import { ItemRoot } from "../item-root/ItemRoot";
import { ItemSection } from "../item-section/ItemSection";
import { ItemSubSection } from "../item-sub-section/ItemSubSection";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";

export const Item: React.FC<{
    currentPage: LandingNode;
    isRoot: boolean;
    openPage: (page: LandingNode) => void;
}> = props => {
    const { currentPage, isRoot, openPage } = props;
    const logoText = React.useMemo(() => getLogoText(currentPage.icon), [currentPage.icon]);

    if (currentPage.type === "root") {
        return <ItemRoot currentPage={currentPage} isRoot={isRoot} logoText={logoText} openPage={openPage} />;
    }

    if (currentPage.type === "section") {
        return <ItemSection currentPage={currentPage} isRoot={isRoot} openPage={openPage} />;
    }

    if (currentPage.type === "sub-section") {
        return <ItemSubSection currentPage={currentPage} isRoot={isRoot} openPage={openPage} />;
    }

    if (currentPage.type === "category") {
        return <ItemCategory currentPage={currentPage} isRoot={isRoot} openPage={openPage} />;
    }

    return null;
};

export const LogoContainer = styled.div`
    margin-top: 15px;

    img {
        margin: 0 30px;
        user-drag: none;
        max-height: 100px;
    }
`;

export const IconContainer = styled.div`
    background: #6d98b8;
    margin-right: 30px;
    border-radius: 50%;
    flex-shrink: 0;
    height: 12vh;
    width: 12vh;
    display: flex;
    align-items: center;

    img {
        width: 100%;
        height: auto;
        user-drag: none;
    }
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    font-size: 36px;
    line-height: 47px;
    font-weight: 300;
    margin: 40px 0px 30px 50px;
`;

export const GroupContainer = styled.div`
    margin-bottom: 20px;
`;

export const GroupTitle = styled.span`
    display: block;
    text-align: left;
    font-size: 32px;
    line-height: 47px;
    font-weight: 700;
`;

export const MarkdownContents = styled(MarkdownViewer)`
    padding: 0;

    h1 {
        display: block;
        text-align: left;
        font-size: 32px;
        line-height: 47px;
        font-weight: 700;
        margin: 0;
    }

    h2 {
        text-align: left;
    }
`;

function getLogoText(logoPath: string) {
    const filename = logoPath.split("/").reverse()[0] || "";
    const name = filename.substring(0, filename.lastIndexOf("."));
    const logoText = _.startCase(name);
    return logoText;
}
