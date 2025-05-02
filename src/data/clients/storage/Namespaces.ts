export const notificationsDataStore = "notifications";
export const dataStoreNamespace = "home-page-app";
export const constantPrefix = "Home Page App Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    ACTIONS: "actions",
    LANDING_PAGES: "landing-pages",
    CONFIG: "config",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.ACTIONS]: [],
    [Namespaces.LANDING_PAGES]: [],
    [Namespaces.CONFIG]: [],
};
