//@ts-ignore
import { HeaderBar } from "@dhis2/ui";
import React from "react";
import i18n from "../../../utils/i18n";

export const DhisLayout: React.FC = ({ children }) => {
    return (
        <React.Fragment>
            <HeaderBar appName={i18n.t("Home Page App")} />
            {children}
        </React.Fragment>
    );
};
