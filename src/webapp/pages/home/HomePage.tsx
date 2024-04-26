import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CircularProgress from "material-ui/CircularProgress";
import styled from "styled-components";
import {
    LandingNode,
    getPrimaryRedirectUrl as getPrimaryActionUrl,
    updateLandingNodes,
} from "../../../domain/entities/LandingNode";
import i18n from "../../../locales";
import { LandingLayout, LandingContent } from "../../components/landing-layout";
import { useAppContext } from "../../contexts/app-context";
import { useNavigate } from "react-router-dom";
import { Item } from "../../components/item/Item";
import { useConfig } from "../settings/useConfig";
import { Cardboard } from "../../components/card-board/Cardboard";
import { BigCard } from "../../components/card-board/BigCard";
import { goTo } from "../../utils/routes";
import { defaultIcon, defaultTitle } from "../../router/Router";
import { useAnalytics } from "../../hooks/useAnalytics";

export const HomePage: React.FC = React.memo(() => {
    const { hasSettingsAccess, landings, reload, isLoading, launchAppBaseUrl, translate, compositionRoot } =
        useAppContext();
    const { defaultApplication, landingPagePermissions, user } = useConfig();

    const userLandings = useMemo<LandingNode[] | undefined>(() => {
        return landings && landingPagePermissions && user
            ? updateLandingNodes(landings, landingPagePermissions, user)
            : undefined;
    }, [landingPagePermissions, landings, user]);

    const initLandings = useMemo(() => userLandings?.filter(landing => landing.executeOnInit), [userLandings]);

    const navigate = useNavigate();
    const analytics = useAnalytics();
    const [history, updateHistory] = useState<LandingNode[]>([]);
    const [isLoadingLong, setLoadingLong] = useState<boolean>(false);
    const [pageType, setPageType] = useState<"userLandings" | "singleLanding">(
        userLandings && userLandings?.length > 1 ? "userLandings" : "singleLanding"
    );

    const favicon = useRef<HTMLLinkElement>(document.head.querySelector('link[rel="icon"]'));

    const currentPage = useMemo<LandingNode | undefined>(() => {
        return history[0] ?? initLandings?.[0];
    }, [history, initLandings]);

    const isRoot = history.length === 0;
    const currentHistory = history[0];

    const openSettings = useCallback(() => {
        navigate("/settings");
    }, [navigate]);

    const openAbout = useCallback(() => {
        navigate("/about");
    }, [navigate]);

    const openPage = useCallback(
        (page: LandingNode) => {
            compositionRoot.analytics.sendPageView({ title: page.name.referenceValue, location: undefined });
            updateHistory(history => [page, ...history]);
        },
        [compositionRoot.analytics]
    );

    const goBack = useCallback(() => {
        if (initLandings?.length === 1 || currentPage?.type !== "root") updateHistory(history => history.slice(1));
        else setPageType("userLandings");
    }, [currentPage, initLandings]);

    const goHome = useCallback(() => {
        if (initLandings?.length === 1) updateHistory([]);
        else setPageType("userLandings");
    }, [initLandings?.length]);

    const logout = useCallback(() => {
        window.location.href = `${launchAppBaseUrl}/dhis-web-commons-security/logout.action`;
    }, [launchAppBaseUrl]);

    useEffect(() => {
        reload();
    }, [reload]);

    useEffect(() => {
        setTimeout(function () {
            setLoadingLong(true);
        }, 8000);
    }, [compositionRoot]);

    useEffect(() => {
        if (initLandings?.length === 0) {
            window.location.href = !defaultApplication
                ? `${launchAppBaseUrl}/dhis-web-dashboard/index.html`
                : `${launchAppBaseUrl}${defaultApplication}`;
        }
        if (initLandings && initLandings?.length > 1) {
            setPageType("userLandings");
        }
    }, [defaultApplication, isLoadingLong, launchAppBaseUrl, initLandings]);

    useEffect(() => {
        const icon = favicon.current;
        icon?.setAttribute("href", (pageType === "singleLanding" && currentPage?.icon) || defaultIcon);
        document.title = (pageType === "singleLanding" && currentPage && translate(currentPage.name)) || defaultTitle;
        return () => {
            icon?.setAttribute("href", defaultIcon);
            document.title = defaultTitle;
        };
    }, [reload, currentPage, pageType, translate]);

    useEffect(() => {
        if (userLandings && userLandings?.length > 1 && pageType === "userLandings") {
            analytics.sendPageView({
                title: "Homepage - Available Home Pages",
                location: `${window.location.hash.split("?")[0]}home-page-app/available-landings`,
            });
        } else if (currentPage && pageType === "singleLanding" && currentHistory) {
            const type = currentPage.type === "root" ? "landing" : currentPage.type;
            analytics.sendPageView({
                title: `Homepage - ${currentPage.name.referenceValue}`,
                location: `${window.location.hash.split("?")[0]}home-page-app/${type}/${currentPage.id}`,
            });
        }
    }, [currentPage, analytics, pageType, userLandings, currentHistory]);

    const redirect = useRedirectOnSinglePrimaryAction(currentPage);

    return (
        <StyledLanding
            backgroundColor={currentPage?.backgroundColor}
            onSettings={hasSettingsAccess ? openSettings : undefined}
            onAbout={openAbout}
            onGoBack={!isRoot && pageType === "singleLanding" ? goBack : undefined}
            onGoHome={!isRoot && pageType === "singleLanding" ? goHome : undefined}
            onLogout={logout}
            centerChildren={true}
        >
            <ContentWrapper>
                {isLoading || redirect.isActive ? (
                    <ProgressContainer>
                        <CircularProgress color={"white"} size={65} />
                        {isLoadingLong ? (
                            <p>{i18n.t("First load can take a couple of minutes, please wait...")}</p>
                        ) : (
                            <p>{i18n.t("Loading the user configuration...")}</p>
                        )}
                    </ProgressContainer>
                ) : initLandings && pageType === "userLandings" ? (
                    <>
                        <h1>Available Home Pages</h1>
                        <Cardboard rowSize={4}>
                            {initLandings?.map(landing => {
                                return (
                                    <BigCard
                                        key={`card-${landing.id}`}
                                        label={translate(landing.name)}
                                        onClick={() => {
                                            openPage(landing);
                                            setPageType("singleLanding");
                                        }}
                                        icon={
                                            landing.icon ? (
                                                <img src={landing.icon} alt={`Icon for ${translate(landing.name)}`} />
                                            ) : undefined
                                        }
                                    />
                                );
                            })}
                        </Cardboard>
                    </>
                ) : currentPage && pageType === "singleLanding" ? (
                    <Item isRoot={isRoot} currentPage={currentPage} openPage={openPage} />
                ) : null}
            </ContentWrapper>
        </StyledLanding>
    );
});

const ProgressContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh;
`;

const StyledLanding = styled(LandingLayout)`
    ${LandingContent} {
        padding: 0px;
        margin: 0px 10px 20px 10px;
    }
`;

const ContentWrapper = styled.div`
    padding: 15px;
    min-height: 100vh;
`;

function useRedirectOnSinglePrimaryAction(landingNode: LandingNode | undefined): { isActive: boolean } {
    const { actions, launchAppBaseUrl } = useAppContext();
    const { user } = useConfig();
    const url = user && landingNode ? getPrimaryActionUrl(landingNode, { actions, user }) : undefined;
    const [isActive, setIsActive] = React.useState(false);

    React.useEffect(() => {
        if (url) {
            goTo(url, { baseUrl: launchAppBaseUrl });
            setIsActive(true);
        }
    }, [url, launchAppBaseUrl]);

    return { isActive };
}
