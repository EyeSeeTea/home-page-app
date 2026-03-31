/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DHIS2_BASE_URL: string;
    readonly VITE_DHIS2_AUTH: string;
    readonly VITE_GOOGLE_ANALYTICS_4?: string;
    readonly VITE_PORT?: string;
    readonly VITE_PROXY_LOG_LEVEL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
