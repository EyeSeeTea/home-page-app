import React from "react";
import { useAppContext } from "../contexts/app-context";

export function useAnalytics() {
    const { compositionRoot } = useAppContext();

    const sendPageView = React.useCallback(
        (overrideProps: { location?: string; title?: string }) => compositionRoot.analytics.sendPageView(overrideProps),
        [compositionRoot]
    );

    const trackMatomoView = React.useCallback(
        (overrideProps: { location?: string; title?: string }) => compositionRoot.matomo.trackView(overrideProps),
        [compositionRoot]
    );

    return {
        sendPageView,
        trackMatomoView,
        sendEvent: undefined, // NOT IMPLEMENTED
    };
}
