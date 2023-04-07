import BackIcon from "@material-ui/icons/ArrowBack";
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import AboutIcon from "@material-ui/icons/Info";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { Tooltip, TooltipWrapper } from "../tooltip/Tooltip";
import { Grid } from "@material-ui/core";

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onGoHome, onGoBack, onSettings, onAbout, onLogout }) => {
    return (
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <div>
                {onGoHome ? (
                    <HomeButton text={i18n.t("Home")} placement={"right"}>
                        <HomeIcon onClick={onGoHome} />
                    </HomeButton>
                ) : null}
                {onSettings ? (
                    <SettingsButton text={i18n.t("Settings")} placement={"right"}>
                        <SettingsIcon onClick={onSettings} />
                    </SettingsButton>
                ) : null}
                {onAbout ? (
                    <SettingsButton text={i18n.t("About")} placement={"right"}>
                        <AboutIcon onClick={onAbout} />
                    </SettingsButton>
                ) : null}
                {onGoBack ? (
                    <HomeButton text={i18n.t("Back")} placement={"right"}>
                        <BackIcon onClick={onGoBack} />
                    </HomeButton>
                ) : null}
            </div>
            <div>
                {onLogout ? (
                    <HomeButton text={i18n.t("Logout")} placement={"left"}>
                        <ExitToAppIcon onClick={onLogout} />
                    </HomeButton>
                ) : null}
            </div>
        </Grid>
    );
};

export interface LandingHeaderProps {
    onGoHome?: () => void;
    onSettings?: () => void;
    onAbout?: () => void;
    onGoBack?: () => void;
    onLogout?: () => void;
}

const HomeButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }

    ${TooltipWrapper}: {
        float: right;
    }
`;

const SettingsButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }

    ${TooltipWrapper}: {
        float: right;
    }
`;
