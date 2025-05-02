import React from "react";
import { LandingNode } from "../../domain/entities/LandingNode";
import { Maybe } from "../../types/utils";
import { CompositionRoot } from "../CompositionRoot";
import { useAppContext } from "../contexts/app-context";

export function useAnalytics() {
    const { compositionRoot } = useAppContext();

    const sendPageView = React.useCallback(
        (overrideProps: { location: string; title: string }) => compositionRoot.analytics.sendPageView(overrideProps),
        [compositionRoot]
    );

    const trackMatomoView = React.useCallback(
        (overrideProps: { location: string; title: string }) => compositionRoot.analytics.trackView(overrideProps),
        [compositionRoot]
    );

    return {
        sendPageView,
        trackMatomoView,
        sendEvent: undefined, // NOT IMPLEMENTED
    };
}

export function useTrackAnalyticsOnLoad(props: UseTrackAnalyticsOnLoadProps) {
    const { compositionRoot, userLandings } = props;

    React.useEffect(() => {
        const initLandings = userLandings?.filter(landing => landing.executeOnInit);

        const pageType = initLandings && initLandings?.length > 1 ? "userLandings" : "singleLanding";
        if (userLandings && userLandings.length > 1 && pageType === "userLandings") {
            trackUserLanding(compositionRoot);
        }

        if (initLandings && initLandings.length > 0 && pageType === "singleLanding") {
            const cuPage = initLandings[0];
            if (!cuPage) return;
            trackSingleLanding(cuPage, compositionRoot);
        }
    }, [compositionRoot, userLandings]);
}

export function buildViewOptionsFromLanding(landing: LandingNode) {
    const type = landing.type === "root" ? "landing" : landing.type;
    return {
        title: `Homepage - ${landing.name.referenceValue}`,
        location: `${getRouteNameFromHash()}home-page-app/${type}/${landing.id}`,
    };
}

export function trackSingleLanding(landing: LandingNode, compositionRoot: CompositionRoot) {
    const viewOptions = buildViewOptionsFromLanding(landing);
    compositionRoot.analytics.sendPageView(viewOptions);
    compositionRoot.analytics.trackView(viewOptions);
}

export function trackUserLanding(compositionRoot: CompositionRoot) {
    const viewOptions = {
        location: `${getRouteNameFromHash()}home-page-app/available-landings`,
        title: "Homepage - Available Home Pages",
    };
    compositionRoot.analytics.sendPageView(viewOptions);
    compositionRoot.analytics.trackView(viewOptions);
}

export function getDefaultLocation() {
    return getRouteNameFromHash() ?? window.location.href;
}

export function getRouteNameFromHash() {
    const routeName = window.location.hash.split("?")[0];
    return routeName?.replace("#", "") ?? "";
}

type UseTrackAnalyticsOnLoadProps = {
    compositionRoot: CompositionRoot;
    userLandings: Maybe<LandingNode[]>;
};
