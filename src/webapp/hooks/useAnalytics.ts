import React from "react";
import { useAppContext } from "../contexts/app-context";

export function useAnalytics() {
    const { compositionRoot } = useAppContext();

    const sendPageView = React.useCallback(
        (overrideProps: { location?: string; title?: string }) => compositionRoot.analytics.sendPageView(overrideProps),
        [compositionRoot]
    );

    return {
        sendPageView,
        sendEvent: undefined, // NOT IMPLEMENTED
    };
}
