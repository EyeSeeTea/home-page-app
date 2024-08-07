import _ from "lodash";
import { Codec, GetSchemaType, Schema } from "../../utils/codec";
import { TranslatableText, TranslatableTextModel } from "./TranslatableText";
import { LandingPagePermission } from "./Permission";
import { User } from "./User";
import { Action, getPageActions } from "./Action";
import { Maybe } from "../../types/utils";

export const LandingPageNodeTypeModel = Schema.oneOf([
    Schema.exact("root"),
    Schema.exact("section"),
    Schema.exact("sub-section"),
    Schema.exact("category"),
]);

export const LandingPageNodePageRenderingModel = Schema.oneOf([Schema.exact("single"), Schema.exact("multiple")]);

export type LandingNodeType = GetSchemaType<typeof LandingPageNodeTypeModel>;

export type LandingNodePageRendering = GetSchemaType<typeof LandingPageNodePageRenderingModel>;

export interface LandingNode {
    id: string;
    parent: string;
    type: LandingNodeType;
    icon: string;
    iconLocation: string;
    iconSize: string;
    favicon: string;
    pageRendering: LandingNodePageRendering | undefined;
    order: number | undefined;
    name: TranslatableText;
    title: TranslatableText | undefined;
    content: TranslatableText | undefined;
    actions: string[];
    children: LandingNode[];
    backgroundColor: string;
    secondary: boolean | undefined;
    executeOnInit: boolean;
}

export const LandingNodeModel: Codec<LandingNode> = Schema.object({
    id: Schema.string,
    parent: Schema.string,
    type: LandingPageNodeTypeModel,
    icon: Schema.optionalSafe(Schema.string, ""),
    iconLocation: Schema.optionalSafe(Schema.string, ""),
    iconSize: Schema.optionalSafe(Schema.string, ""),
    favicon: Schema.optionalSafe(Schema.string, ""),
    pageRendering: Schema.optional(LandingPageNodePageRenderingModel),
    order: Schema.optional(Schema.integer),
    name: TranslatableTextModel,
    title: Schema.optional(TranslatableTextModel),
    content: Schema.optional(TranslatableTextModel),
    actions: Schema.optionalSafe(Schema.array(Schema.string), []),
    children: Schema.lazy(() => Schema.array(LandingNodeModel)),
    backgroundColor: Schema.optionalSafe(Schema.string, ""),
    secondary: Schema.optional(Schema.boolean),
    executeOnInit: Schema.optionalSafe(Schema.boolean, true),
});

export interface OrderedLandingNode extends LandingNode {
    lastOrder: number;
}

export const buildOrderedLandingNodes = (nodes: LandingNode[]): OrderedLandingNode[] => {
    return nodes.map(node => ({
        ...node,
        lastOrder: nodes.length - 1,
        children: buildOrderedLandingNodes(node.children),
    }));
};

function updateNodesPermissions(nodes: LandingNode[], permissions: LandingPagePermission[], user: User): LandingNode[] {
    const updatedNodes = _(nodes)
        .map(node => {
            const pagePermission = permissions?.find(permission => permission.id === node.id);

            const hasUserAccess = pagePermission?.users?.map(user => user.id).includes(user.id);
            const hasUserGroupAccess =
                _.intersection(
                    pagePermission?.userGroups?.map(({ id }) => id),
                    user.userGroups.map(({ id }) => id)
                ).length > 0;
            const hasPublicAccess = !pagePermission || pagePermission.publicAccess !== "--------";

            if (!hasUserAccess && !hasUserGroupAccess && !hasPublicAccess) return null;

            return {
                ...node,
                children: updateNodesPermissions(node.children, permissions, user),
            };
        })
        .compact()
        .value();

    return updatedNodes;
}

function spreadFavicon(node: LandingNode, favicon: string): LandingNode {
    return {
        ...node,
        favicon: favicon,
        children: node.children.map(child => spreadFavicon(child, favicon)),
    };
}

export function updateLandings(
    landings: LandingNode[],
    permissions: LandingPagePermission[],
    user: User
): LandingNode[] {
    const landingsWithPermissions = updateNodesPermissions(landings, permissions, user);

    return landingsWithPermissions.map(landing => spreadFavicon(landing, landing.favicon));
}

// Return
// a redirect URL if there is only one visible action on primary nodes
// a redirect page id when there is only one visible action on primary nodes
export function getPrimaryRedirectNodes(
    landingNode: LandingNode,
    options: { actions: Action[]; user: User }
): { redirectUrl: Maybe<Url>; redirectPageId: Maybe<string> } {
    const { actions, user } = options;

    const actionsById = _.keyBy(actions, action => action.id);
    const showAllActions = false;
    const isRoot = true;

    const pageActions = _(landingNode.children)
        .reject(node => Boolean(node.secondary))
        .flatMap((node): Action[] => {
            const nodeActions = actions.filter(action => node.actions.includes(action.id));
            const actionIds = user && getPageActions(isRoot, showAllActions, actions, user, nodeActions);

            return _(actionIds)
                .map(actionId => actionsById[actionId])
                .compact()
                .value();
        })
        .value();

    const launchUrls = _.map(pageActions, action => action.dhisLaunchUrl);
    const launchPageIds = _.map(pageActions, action => action.launchPageId);

    const redirectUrl = launchUrls.length === 1 ? launchUrls[0] : undefined;
    const redirectPageId = launchPageIds.length === 1 ? launchPageIds[0] : undefined;

    const message = [
        `Primary URLs [${launchUrls.length}]: ${launchUrls.join(", ")}`,
        `Redirect URL: ${redirectUrl || "-"}`,
        `Primary Page IDs [${launchPageIds.length}]: ${launchPageIds.join(", ")}`,
        `Redirect Page ID: ${redirectPageId || "-"}`,
    ].join("\n");

    console.debug(message);

    return { redirectUrl, redirectPageId };
}

export function flattenLandingNodes(nodes: LandingNode[]): LandingNode[] {
    return nodes.flatMap(node => [node, ...flattenLandingNodes(node.children)]);
}

type Url = string;
