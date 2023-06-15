import _ from "lodash";
import { Codec, GetSchemaType, Schema } from "../../utils/codec";
import { TranslatableText, TranslatableTextModel } from "./TranslatableText";
import { LandingPagePermission } from "./Permission";
import { User } from "./User";

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
    pageRendering: LandingNodePageRendering | undefined;
    order: number | undefined;
    name: TranslatableText;
    title: TranslatableText | undefined;
    content: TranslatableText | undefined;
    actions: string[];
    children: LandingNode[];
    backgroundColor: string;
}

export const LandingNodeModel: Codec<LandingNode> = Schema.object({
    id: Schema.string,
    parent: Schema.string,
    type: LandingPageNodeTypeModel,
    icon: Schema.optionalSafe(Schema.string, ""),
    iconLocation: Schema.optionalSafe(Schema.string, ""),
    pageRendering: Schema.optional(LandingPageNodePageRenderingModel),
    order: Schema.optional(Schema.integer),
    name: TranslatableTextModel,
    title: Schema.optional(TranslatableTextModel),
    content: Schema.optional(TranslatableTextModel),
    actions: Schema.optionalSafe(Schema.array(Schema.string), []),
    children: Schema.lazy(() => Schema.array(LandingNodeModel)),
    backgroundColor: Schema.optionalSafe(Schema.string, ""),
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

export const updateLandingNodes = (
    nodes: LandingNode[],
    permissions: LandingPagePermission[],
    user: User
): LandingNode[] => {
    return _(nodes)
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
                children: updateLandingNodes(node.children, permissions, user),
            };
        })
        .compact()
        .value();
};
