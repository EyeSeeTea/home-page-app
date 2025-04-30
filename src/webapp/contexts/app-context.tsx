import React, { useCallback, useContext, useEffect, useState } from "react";
import { CompositionRoot } from "../CompositionRoot";
import { LandingNode } from "../../domain/entities/LandingNode";
import { Action } from "../../domain/entities/Action";
import { buildTranslate, TranslateMethod } from "../../domain/entities/TranslatableText";

import axios from "axios";
import { cacheImages } from "../utils/image-cache";
import { Typography } from "@material-ui/core";
import i18n from "../../utils/i18n";
import { Maybe } from "../../types/utils";

const AppContext = React.createContext<AppContextState | null>(null);

export const AppContextProvider: React.FC<{ context: AppContextProviderProps }> = ({ children, context }) => {
    const { locale, compositionRoot } = context || {};
    const [actions, setActions] = useState<Action[]>([]);
    const [landings, setLandings] = useState<LandingNode[] | undefined>();
    const [hasSettingsAccess, setHasSettingsAccess] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [launchAppBaseUrl, setLaunchAppBaseUrl] = useState<string>("");
    const translate = buildTranslate(locale || "en");

    const getLandingNodeById = useCallback((id: string) => landings?.find(landing => landing.id === id), [landings]);

    const reload = useCallback(async () => {
        setIsLoading(true);
        if (!compositionRoot) return;
        const actions = await compositionRoot.actions.list();
        const landings = await compositionRoot.landings.list();

        cacheImages(JSON.stringify(actions));
        cacheImages(JSON.stringify(landings));

        setActions(actions);
        setLandings(landings);
        setIsLoading(false);
    }, [compositionRoot]);

    useEffect(() => {
        if (!compositionRoot) return;
        compositionRoot.user.checkSettingsPermissions().then(setHasSettingsAccess);
        compositionRoot.user.checkAdminAuthority().then(setIsAdmin);
    }, [compositionRoot]);

    useEffect(() => {
        getLaunchAppBaseUrl().then(setLaunchAppBaseUrl);
    }, []);

    return compositionRoot ? (
        <AppContext.Provider
            value={{
                compositionRoot,
                actions,
                landings,
                translate,
                reload,
                isLoading,
                hasSettingsAccess,
                isAdmin,
                launchAppBaseUrl,
                getLandingNodeById,
            }}
        >
            {children}
        </AppContext.Provider>
    ) : (
        <Typography>{i18n.t("Composition root uninitialized")}</Typography>
    );
};

async function getLaunchAppBaseUrl() {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
        return process.env.REACT_APP_DHIS2_BASE_URL;
    } else {
        const { data: manifest } = await axios.get<any>("manifest.webapp");
        return manifest.activities.dhis.href;
    }
}

export function useAppContext(): AppContextState {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}

type ReloadMethod = () => Promise<void>;

export interface AppContextProviderProps {
    compositionRoot: CompositionRoot;
    locale: string;
}

export interface AppContextState {
    actions: Action[];
    landings: LandingNode[] | undefined;
    compositionRoot: CompositionRoot;
    translate: TranslateMethod;
    reload: ReloadMethod;
    isLoading: boolean;
    hasSettingsAccess: boolean;
    isAdmin: boolean;
    launchAppBaseUrl: string;
    getLandingNodeById: (id: string) => Maybe<LandingNode>;
}
