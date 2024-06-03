import { PersistedLandingPage } from "../../../data/entities/PersistedLandingNode";
import { LandingNode } from "../../entities/LandingNode";

export function duplicatedNodes(): PersistedLandingPage[] {
    const firstLandingPage = validLandingPagesTree[0];
    const secondLandingPage = validLandingPagesTree[1];

    const section = secondLandingPage && secondLandingPage[1];

    if (firstLandingPage && secondLandingPage && section) return [firstLandingPage, [...secondLandingPage, section]];
    else throw Error("Bad test setup");
}

export function childrenOutOfPlace() {
    const firstLandingPage = validLandingPagesTree[0];
    const secondLandingPage = validLandingPagesTree[1];

    const section = secondLandingPage && secondLandingPage[1];

    if (firstLandingPage && secondLandingPage && section) return [[...firstLandingPage, section], secondLandingPage];
    else throw Error("Bad test setup");
}

export const sectionNode: LandingNode = {
    actions: [],
    backgroundColor: "",
    content: {
        key: "XusobLebMel-content",
        referenceValue: "This is my first section",
        translations: {},
    },
    executeOnInit: true,
    icon: "",
    iconLocation: "",
    iconSize: "",
    favicon: "",
    id: "XusobLebMel",
    name: {
        key: "XusobLebMel-name",
        referenceValue: "My first section",
        translations: {},
    },
    order: 0,
    pageRendering: "multiple",
    parent: "pAfyLmQmCU6",
    secondary: false,
    title: {
        key: "XusobLebMel-title",
        referenceValue: "My first section",
        translations: {},
    },
    type: "section",
    children: [
        {
            actions: [],
            backgroundColor: "",
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "ycAtL2slUDJ",
            name: {
                key: "ycAtL2slUDJ-name",
                referenceValue: "This is a subsection",
                translations: {},
            },
            order: 0,
            pageRendering: "multiple",
            parent: "XusobLebMel",
            secondary: false,
            title: {
                key: "ycAtL2slUDJ-title",
                referenceValue: "This is a subsection",
                translations: {},
            },
            type: "sub-section",
            content: undefined,
            children: [],
        },
    ],
};

export const validLandingPagesTree: PersistedLandingPage[] = [
    [
        {
            actions: ["google-action", "dhis-2-academy", "github"],
            backgroundColor: "#276696",
            content: {
                key: "pAfyLmQmCU6-content",
                referenceValue: "This is a template for developing and testing purposes",
                translations: {},
            },
            executeOnInit: true,
            icon: "img/logo-eyeseetea.png",
            iconLocation: "top",
            iconSize: "small",
            favicon: "img/logo-eyeseetea.png",
            id: "pAfyLmQmCU6",
            name: {
                key: "pAfyLmQmCU6-name",
                referenceValue: "General Landing Page",
                translations: {},
            },
            order: undefined,
            pageRendering: "multiple",
            parent: "none",
            secondary: false,
            title: {
                key: "pAfyLmQmCU6-title",
                referenceValue: "General Page",
                translations: {},
            },
            type: "root",
        },
        {
            actions: [],
            backgroundColor: "",
            content: {
                key: "XusobLebMel-content",
                referenceValue: "This is my first section",
                translations: {},
            },
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "XusobLebMel",
            name: {
                key: "XusobLebMel-name",
                referenceValue: "My first section",
                translations: {},
            },
            order: 0,
            pageRendering: "multiple",
            parent: "pAfyLmQmCU6",
            secondary: false,
            title: {
                key: "XusobLebMel-title",
                referenceValue: "My first section",
                translations: {},
            },
            type: "section",
        },
        {
            actions: [],
            backgroundColor: "",
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "ycAtL2slUDJ",
            name: {
                key: "ycAtL2slUDJ-name",
                referenceValue: "This is a subsection",
                translations: {},
            },
            order: 0,
            pageRendering: "multiple",
            parent: "XusobLebMel",
            secondary: false,
            title: {
                key: "ycAtL2slUDJ-title",
                referenceValue: "This is a subsection",
                translations: {},
            },
            type: "sub-section",
            content: undefined,
        },
    ],
    [
        {
            actions: [],
            backgroundColor: "#0008FF",
            content: {
                key: "SEuEePxkvE7-content",
                referenceValue:
                    "This landing page is a template intended for develop and testing purposes, in this case DHIS2 actions as an example",
                translations: {},
            },
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "SEuEePxkvE7",
            name: {
                key: "SEuEePxkvE7-name",
                referenceValue: "DHIS2 Landing",
                translations: {},
            },
            order: 1,
            pageRendering: "multiple",
            parent: "none",
            secondary: false,
            title: {
                key: "SEuEePxkvE7-title",
                referenceValue: "DHIS2 Landing",
                translations: {},
            },
            type: "root",
        },
        {
            actions: ["dhis-2", "dhis-2-community"],
            backgroundColor: "",
            content: {
                key: "MmG1BCLXE1Q-content",
                referenceValue: "This is a section with general actions",
                translations: {},
            },
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "MmG1BCLXE1Q",
            name: {
                key: "MmG1BCLXE1Q-name",
                referenceValue: "DHIS2 General",
                translations: {},
            },
            order: 0,
            pageRendering: "multiple",
            parent: "SEuEePxkvE7",
            secondary: false,
            title: {
                key: "MmG1BCLXE1Q-title",
                referenceValue: "DHIS2 General",
                translations: {},
            },
            type: "section",
        },
        {
            actions: ["dhis-2-ui", "dhis-2-documentation"],
            backgroundColor: "",
            content: {
                key: "Jqdtr2lTgNP-content",
                referenceValue: "Frontend, Backend",
                translations: {},
            },
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "Jqdtr2lTgNP",
            name: {
                key: "Jqdtr2lTgNP-name",
                referenceValue: "DHIS2 Dev Specific",
                translations: {},
            },
            order: 1,
            pageRendering: "multiple",
            parent: "SEuEePxkvE7",
            secondary: false,
            title: {
                key: "Jqdtr2lTgNP-title",
                referenceValue: "DHIS2 Dev Specific",
                translations: {},
            },
            type: "section",
        },
        {
            actions: ["dhis-2-api"],
            backgroundColor: "",
            content: {
                key: "jFYOc9eUhVd-content",
                referenceValue: "API DOCS",
                translations: {},
            },
            executeOnInit: true,
            icon: "",
            iconLocation: "",
            iconSize: "",
            favicon: "",
            id: "jFYOc9eUhVd",
            name: {
                key: "jFYOc9eUhVd-name",
                referenceValue: "API Documentation",
                translations: {},
            },
            order: 0,
            pageRendering: "multiple",
            parent: "Jqdtr2lTgNP",
            secondary: false,
            title: {
                key: "jFYOc9eUhVd-title",
                referenceValue: "API Documentation",
                translations: {},
            },
            type: "sub-section",
        },
    ],
];
