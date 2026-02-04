//@ts-ignore
import React from "react";
import i18n from "../../../utils/i18n";
import { HeaderBar } from "../header-bar/HeaderBar";
import { useDisplayGlobalShellHeader } from "../../hooks/useDisplayGlobalShellHeader";

export const DhisLayout: React.FC = ({ children }) => {
    useDisplayGlobalShellHeader("block");
    return (
        <React.Fragment>
            <HeaderBar appName={i18n.t("Home Page App")} />
            {children}
        </React.Fragment>
    );
};
