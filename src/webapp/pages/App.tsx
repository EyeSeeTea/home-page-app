import { MuiThemeProvider, StylesProvider } from "@material-ui/core/styles";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";

import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { AppContextProvider, AppContextProviderProps } from "../contexts/app-context";
import { Router } from "../router/Router";
import muiThemeLegacy from "../themes/dhis2-legacy.theme";
import { muiTheme } from "../themes/dhis2.theme";
import { useConfig } from "./settings/useConfig";
import "./App.css";
import {
    UserNotificationDialog,
    UserNotificationDialogProps,
} from "../components/user-notification/UserNotificationDialog";
import { getCompositionRoot } from "../CompositionRoot";
import { Instance } from "../../data/entities/Instance";

const App: React.FC<{ locale: string; baseUrl: string }> = ({ locale, baseUrl }) => {
    const [appContextProps, setAppContextProps] = React.useState<AppContextProviderProps | null>(null);

    const [userNotificationDialogProps, setUserNotificationDialogProps] = useState<UserNotificationDialogProps | null>(
        null
    );

    useEffect(() => {
        async function setup() {
            const compositionRoot = await getCompositionRoot(new Instance({ url: baseUrl }));

            const notifications = await compositionRoot.notifications.getUserNotifications().toPromise();
            if (notifications.length > 0) {
                setUserNotificationDialogProps({
                    notifications,
                    onClose: () => {
                        setUserNotificationDialogProps(null);
                        setAppContextProps({ locale, compositionRoot });
                    },
                    onConfirm: () => {
                        setUserNotificationDialogProps(null);
                        setAppContextProps({ locale, compositionRoot });
                        return compositionRoot.notifications.readUserNotifications(notifications);
                    },
                });
            } else {
                setAppContextProps({ locale, compositionRoot });
            }
        }
        setup();
    }, [baseUrl, locale]);

    if (userNotificationDialogProps) {
        return <UserNotificationDialog {...userNotificationDialogProps} />;
    }

    return appContextProps ? (
        <AppContextProvider context={appContextProps}>
            <Analytics />
            <StylesProvider injectFirst>
                <MuiThemeProvider theme={muiTheme}>
                    <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                        <SnackbarProvider>
                            <LoadingProvider>
                                <div id="app" className="content">
                                    <Router />
                                </div>
                            </LoadingProvider>
                        </SnackbarProvider>
                    </OldMuiThemeProvider>
                </MuiThemeProvider>
            </StylesProvider>
        </AppContextProvider>
    ) : (
        <h3>Loading...</h3>
    );
};

const Analytics: React.FC = () => {
    const { googleAnalyticsCode } = useConfig();

    useEffect(() => {
        if (!googleAnalyticsCode) return;
        const headElement = document.head || document.getElementsByTagName("head")[0];
        const src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsCode}`;
        const scriptAlreadyExist = (headElement.firstChild as HTMLScriptElement).src === src;

        if (scriptAlreadyExist) return;

        const scriptElement = document.createElement("script");
        scriptElement.async = true;
        scriptElement.src = src;
        headElement.insertBefore(scriptElement, headElement.firstChild);
    }, [googleAnalyticsCode]);

    return <></>; //return as <script/> seems GA doesn't like that :$
};

export default React.memo(App);
