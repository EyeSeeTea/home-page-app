import { useEffect } from "react";

export function useDisplayGlobalShellHeader(display: "none" | "block") {
    useEffect(() => {
        const renderAppAsIframe = window.self !== window.top && window.parent !== window.self;

        if (renderAppAsIframe) {
            try {
                const parentDoc = window.parent.document;
                const selectors = [
                    "header.global-shell-header",
                    '[class*="global-shell-header"]',
                    'header[data-test="headerbar"]',
                    "header.jsx-3716963661",
                ];

                for (const selector of selectors) {
                    const header = parentDoc.querySelector(selector);
                    if (header) {
                        (header as HTMLElement).style.display = display;
                    }
                }
            } catch (error) {
                console.warn("Could not hide Global Shell header:", error);
            }
        }
    }, [display]);
}
