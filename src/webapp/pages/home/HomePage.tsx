import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CircularProgress from "material-ui/CircularProgress";
import styled from "styled-components";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useNavigate } from "react-router-dom";
import {
    LandingNode,
    flattenLandingNodes,
    getPrimaryRedirectNodes as getPrimaryActionNodes,
} from "../../../domain/entities/LandingNode";
import { LandingLayout, LandingContent } from "../../components/landing-layout";
import { useAppContext } from "../../contexts/app-context";
import { Item } from "../../components/item/Item";
import { useConfig } from "../settings/useConfig";
import { Cardboard } from "../../components/card-board/Cardboard";
import { BigCard } from "../../components/card-board/BigCard";
import { goTo } from "../../utils/routes";
import { defaultIcon, defaultTitle } from "../../router/Router";
import { Maybe } from "../../../types/utils";
import i18n from "../../../utils/i18n";
import { trackSingleLanding, trackUserLanding, useTrackAnalyticsOnLoad } from "../../hooks/useAnalytics";
import { getNumberActionsToShowPerRow } from "../../utils/cards";

export const HomePage: React.FC = React.memo(() => {
    const { hasSettingsAccess, reload, isLoading, launchAppBaseUrl, translate, compositionRoot } = useAppContext();
    const { defaultApplication, userLandings, trackViews } = useConfig();

    const initLandings = useMemo(() => userLandings?.filter(landing => landing.executeOnInit), [userLandings]);

    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const [history, updateHistory] = useState<LandingNode[]>([]);
    const [isLoadingLong, setLoadingLong] = useState<boolean>(false);
    const [pageType, setPageType] = useState<PageType>(
        userLandings && userLandings?.length > 1 ? "userLandings" : "singleLanding"
    );

    const favicon = useRef<HTMLLinkElement>(document.head.querySelector('link[rel="shortcut icon"]'));

    const currentPage = useMemo<LandingNode | undefined>(() => {
        return history[0] ?? initLandings?.[0];
    }, [history, initLandings]);

    const isRoot = _.isEmpty(history);
    const isRootPage = currentPage?.type === "root";
    const isSingleLanding = pageType === "singleLanding";
    const hasSingleInitLanding = initLandings?.length === 1;

    useTrackAnalyticsOnLoad({ trackViews, userLandings });

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
                trackSingleLanding(page, trackViews);
                updateHistory(history => [page, ...history]);
            } else {
                snackbar.error(i18n.t("You do not have access to this page."));
            }
        },
        [trackViews, userLandings, snackbar]
    );

    const goBack = useCallback(() => {
        const allHistoryMatchesCurrentPage = _.every(history, landing => landing.id === currentPage?.id);

        if (isRootPage && allHistoryMatchesCurrentPage) {
            updateHistory([]);
            setPageType("userLandings");
            trackUserLanding(trackViews);
        } else if (hasSingleInitLanding || !isRootPage || !isRoot) {
            updateHistory(history => history.slice(1));
            if (currentPage) {
                trackSingleLanding(currentPage, trackViews);
            }
        } else {
            setPageType("userLandings");
            trackUserLanding(trackViews);
        }
    }, [trackViews, currentPage, hasSingleInitLanding, history, isRoot, isRootPage]);

    const allowBackNavigation = useMemo(() => {
        const isMultipleLandingSubPage = !isRoot && initLandings !== undefined && initLandings.length > 1;
        const isSingleLandingSubPage = initLandings?.length === 1 && history.length > 1;

        return isSingleLanding && (isMultipleLandingSubPage || isSingleLandingSubPage);
    }, [history, initLandings, isRoot, isSingleLanding]);

    const goHome = useCallback(() => {
        if (initLandings?.length === 1) {
            updateHistory([]);
        } else {
            setPageType("userLandings");
            trackUserLanding(trackViews);
        }
    }, [trackViews, initLandings?.length]);

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
        if (isSingleLanding && hasSingleInitLanding && isRootPage && isRoot) {
            updateHistory(history => [currentPage, ...history]);
        }
    }, [currentPage, hasSingleInitLanding, isRoot, isRootPage, isSingleLanding]);

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
        const pageFavicon = currentPage?.favicon;

        icon?.setAttribute("href", (isSingleLanding && pageFavicon) || defaultIcon);
        document.title = (isSingleLanding && currentPage && translate(currentPage.name)) || defaultTitle;
        return () => {
            icon?.setAttribute("href", defaultIcon);
            document.title = defaultTitle;
        };
    }, [reload, currentPage, isSingleLanding, translate]);

    const redirect = useRedirectOnSinglePrimaryNode(currentPage, userLandings, initLandings);
    const pageToRender = redirect.currentPage || (currentPage && isSingleLanding ? currentPage : undefined);

    const totalLandings = initLandings?.length ?? 0;

    const rowSize = getNumberActionsToShowPerRow(totalLandings);

    return (
        <StyledLanding
            backgroundColor={currentPage?.backgroundColor}
            onSettings={hasSettingsAccess ? openSettings : undefined}
            onAbout={openAbout}
            onGoBack={allowBackNavigation ? goBack : undefined}
            onGoHome={showHomeButton(pageType, totalLandings) ? goHome : undefined}
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
                        <h1>{i18n.t("Available Home Pages")}</h1>
                        <Cardboard rowSize={rowSize}>
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
                ) : pageToRender ? (
                    <Item isRoot={isRoot} currentPage={pageToRender} openPage={openPage} />
                ) : null}
            </ContentWrapper>
        </StyledLanding>
    );
});

function showHomeButton(pageType: PageType, totalLandings: number): boolean {
    return pageType === "singleLanding" && totalLandings > 1;
}

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

function useRedirectOnSinglePrimaryNode(
    landingNode: Maybe<LandingNode>,
    userLandings: Maybe<LandingNode[]>,
    initLandings: Maybe<LandingNode[]>
): { isActive: boolean; currentPage: Maybe<LandingNode> } {
    const { actions, launchAppBaseUrl } = useAppContext();
    const { user } = useConfig();
    const url =
        user && landingNode && initLandings?.length === 1
            ? getPrimaryActionNodes(landingNode, { actions, user })
            : undefined;

    const [isActive, setIsActive] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState<LandingNode | undefined>();

    React.useEffect(() => {
        if (url) {
            const { redirectPageId, redirectUrl } = url;
            if (redirectUrl && redirectPageId) {
                return;
            }
            if (redirectUrl) {
                goTo(redirectUrl, { baseUrl: launchAppBaseUrl });
                setIsActive(true);
            }
            if (redirectPageId) {
                const page = userLandings?.find(landing => landing.id === redirectPageId);
                if (page) {
                    setCurrentPage(page);
                }
            }
        }
    }, [url, launchAppBaseUrl, userLandings]);

    return { isActive: isActive, currentPage: currentPage };
}

const pageTypes = ["userLandings", "singleLanding"] as const;
type PageType = typeof pageTypes[number];
