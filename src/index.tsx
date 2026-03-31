import { Provider } from "@dhis2/app-runtime";
import i18n from "./utils/i18n";
import axios from "axios";
import { init } from "d2";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { D2Api } from "./types/d2-api";
import App from "./webapp/pages/App";
import "./webapp/utils/wdyr";
import { getMigrationTasks } from "./migrations/tasks";
import { DataStoreStorage, Migrations } from "./d2-migrations";

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

// Load Google Analytics when VITE_GOOGLE_ANALYTICS_4 is set
const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_4;
if (gaId) {
    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag = gtag as typeof window.gtag;
    gtag("js", new Date());
    gtag("config", gaId);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
}

const isDev = import.meta.env.DEV;

async function getBaseUrl() {
    if (isDev) {
        return "/dhis2"; // See vite.config.ts proxy
    } else {
        const { data: manifest } = await axios.get<any>("manifest.webapp");
        return manifest.activities.dhis.href;
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const d2 = await init({ baseUrl: baseUrl + "/api", schemas: [] });
        const api = new D2Api({ baseUrl });
        if (isDev) Object.assign(window, { d2, api });

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);

        const storage = new DataStoreStorage(api, "home-page-app");
        const migrationsTasks = await getMigrationTasks();

        type ProviderProps = React.ComponentProps<typeof Provider>;
        const config: ProviderProps["config"] = { baseUrl, apiVersion: 30 };

        ReactDOM.render(
            <React.StrictMode>
                <Provider config={config} plugin={false} parentAlertsAdd={() => undefined} showAlertsInPlugin={false}>
                    <Migrations storage={storage} tasks={migrationsTasks}>
                        <App locale={userSettings.keyUiLocale} baseUrl={baseUrl} />
                    </Migrations>
                </Provider>
            </React.StrictMode>,
            document.getElementById("root")
        );
    } catch (err: any) {
        console.error(err);
        const feedback = err.toString().match("Unable to get schemas") ? (
            <h3 style={{ margin: 20 }}>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
                {` ${baseUrl}`}
            </h3>
        ) : (
            <h3>{err.toString()}</h3>
        );
        ReactDOM.render(<div>{feedback}</div>, document.getElementById("root"));
    }
}

main();
