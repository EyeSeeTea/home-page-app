import React from "react";
import { LandingNode } from "../../domain/entities/LandingNode";
import { Maybe } from "../../types/utils";
import { AnalyticsEvent, SendAnalyticsEventType } from "../utils/analytics";

export function useTrackAnalyticsOnLoad(props: UseTrackAnalyticsOnLoadProps) {
    const { trackViews, userLandings } = props;

    React.useEffect(() => {
        const initLandings = userLandings?.filter(landing => landing.executeOnInit);

        const pageType = initLandings && initLandings?.length > 1 ? "userLandings" : "singleLanding";
        if (userLandings && userLandings.length > 1 && pageType === "userLandings") {
            trackUserLanding(trackViews);
        }

        if (initLandings && initLandings.length > 0 && pageType === "singleLanding") {
            const cuPage = initLandings[0];
            if (!cuPage) return;
            trackSingleLanding(cuPage, trackViews);
        }
    }, [trackViews, userLandings]);
}

export function buildViewOptionsFromLanding(landing: LandingNode): AnalyticsEvent {
    const type = landing.type === "root" ? "landing" : landing.type;
    return {
        name: "page_view",
        pageTitle: `Homepage - ${landing.name.referenceValue}`,
        pageLocation: `${getRouteNameFromHash()}home-page-app/${type}/${landing.id}`,
    };
}

export function trackSingleLanding(landing: LandingNode, trackViews: SendAnalyticsEventType) {
    const viewOptions = buildViewOptionsFromLanding(landing);
    trackViews(viewOptions);
}

export function trackUserLanding(trackViews: SendAnalyticsEventType) {
    const viewOptions: AnalyticsEvent = {
        name: "page_view",
        pageLocation: `${getRouteNameFromHash()}home-page-app/available-landings`,
        pageTitle: "Homepage - Available Home Pages",
    };
    trackViews(viewOptions);
}

export function getDefaultLocation() {
    return getRouteNameFromHash() ?? window.location.href;
}

export function getRouteNameFromHash() {
    const routeName = window.location.hash.split("?")[0];
    return routeName?.replace("#", "") ?? "";
}

type UseTrackAnalyticsOnLoadProps = {
    trackViews: SendAnalyticsEventType;
    userLandings: Maybe<LandingNode[]>;
};
