import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CircularProgress from "material-ui/CircularProgress";
import styled from "styled-components";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import {
    LandingNode,
    flattenLandingNodes,
    getPrimaryRedirectUrl as getPrimaryActionUrl,
} from "../../../domain/entities/LandingNode";
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
import { Maybe } from "../../../types/utils";
import i18n from "../../../locales";
import _ from "lodash";

export const HomePage: React.FC = React.memo(() => {
    const { hasSettingsAccess, reload, isLoading, launchAppBaseUrl, translate, compositionRoot } = useAppContext();
    const { defaultApplication, userLandings } = useConfig();

    const initLandings = useMemo(() => userLandings?.filter(landing => landing.executeOnInit), [userLandings]);

    const navigate = useNavigate();
    const analytics = useAnalytics();
    const snackbar = useSnackbar();
    const [history, updateHistory] = useState<LandingNode[]>([]);
    const [isLoadingLong, setLoadingLong] = useState<boolean>(false);
    const [pageType, setPageType] = useState<"userLandings" | "singleLanding">(
        userLandings && userLandings?.length > 1 ? "userLandings" : "singleLanding"
    );

    const favicon = useRef<HTMLLinkElement>(document.head.querySelector('link[rel="shortcut icon"]'));

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
            const nodes = userLandings && flattenLandingNodes(userLandings);
            if (nodes?.some(landing => landing.id === page.id)) {
                compositionRoot.analytics.sendPageView({ title: page.name.referenceValue, location: undefined });
                updateHistory(history => [page, ...history]);
            } else {
                snackbar.error(i18n.t("You do not have access to this page."));
            }
        },
        [compositionRoot.analytics, userLandings, snackbar]
    );

    const goBack = useCallback(() => {
        if (currentPage?.type === "root" && _.every(history, landing => landing.id === currentPage.id)) {
            updateHistory([]);
            setPageType("userLandings");
        } else if (
            initLandings?.length === 1 ||
            currentPage?.type !== "root" ||
            (currentPage?.type === "root" && !_.isEmpty(history))
        ) {
            updateHistory(history => history.slice(1));
        } else setPageType("userLandings");
    }, [currentPage, history, initLandings?.length]);

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
        const pageFavicon = currentPage?.favicon || currentPage?.icon;

        icon?.setAttribute("href", (pageType === "singleLanding" && pageFavicon) || defaultIcon);
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

    const redirect = useRedirectOnSinglePrimaryAction(currentPage, userLandings);

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
                                        iconSize={landing.iconSize}
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

function useRedirectOnSinglePrimaryAction(
    landingNode: Maybe<LandingNode>,
    userLandings: Maybe<LandingNode[]>
): { isActive: boolean } {
    const { actions, launchAppBaseUrl } = useAppContext();
    const { user } = useConfig();
    const url =
        user && landingNode && userLandings?.length === 1
            ? getPrimaryActionUrl(landingNode, { actions, user })
            : undefined;

    const [isActive, setIsActive] = React.useState(false);

    React.useEffect(() => {
        if (url) {
            goTo(url, { baseUrl: launchAppBaseUrl });
            setIsActive(true);
        }
    }, [url, launchAppBaseUrl]);

    return { isActive };
}
