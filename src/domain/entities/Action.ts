import _ from "lodash";
import { PartialBy } from "../../types/utils";
import { GetSchemaType, Schema } from "../../utils/codec";
import { BaseMetadataModel } from "./Ref";
import { TranslatableTextModel } from "./TranslatableText";
import { User } from "./User";
import { ModelValidation } from "./Validation";

export const ActionTypeModel = Schema.oneOf([
    Schema.exact("app"),
    // Schema.exact("core"),
    // Schema.exact("widget"),
]);

export const defaultTranslatableModel = (type: string) => ({
    key: `action-${type}`,
    referenceValue: "",
    translations: {},
});

export const ActionModel = Schema.extend(
    BaseMetadataModel,
    Schema.object({
        id: Schema.string,
        name: TranslatableTextModel,
        description: Schema.optionalSafe(TranslatableTextModel, defaultTranslatableModel("description")),
        icon: Schema.string,
        iconLocation: Schema.optionalSafe(Schema.string, ""),
        backgroundColor: Schema.optionalSafe(Schema.string, ""),
        fontColor: Schema.optionalSafe(Schema.string, ""),
        textAlignment: Schema.optionalSafe(Schema.string, ""),
        type: ActionTypeModel,
        disabled: Schema.optionalSafe(Schema.boolean, false),
        dhisVersionRange: Schema.string,
        dhisAppKey: Schema.string,
        dhisLaunchUrl: Schema.string,
        dhisAuthorities: Schema.array(Schema.string),
        installed: Schema.boolean,
        compatible: Schema.boolean,
        editable: Schema.boolean,
    })
);

export type Action = GetSchemaType<typeof ActionModel>;
export type ActionType = GetSchemaType<typeof ActionTypeModel>;

export type PartialAction = PartialBy<
    Action,
    | "user"
    | "created"
    | "lastUpdated"
    | "lastUpdatedBy"
    | "publicAccess"
    | "userAccesses"
    | "userGroupAccesses"
    | "installed"
    | "editable"
    | "compatible"
>;

export const isValidActionType = (type: string): type is ActionType => {
    //return ["app", "core", "widget"].includes(type);
    return ["app"].includes(type);
};

export const actionValidations: ModelValidation[] = [
    {
        property: "id",
        validation: "hasValue",
        alias: "code",
    },
    {
        property: "name.referenceValue",
        validation: "hasValue",
        alias: "name",
    },
    {
        property: "dhisLaunchUrl",
        validation: "hasText",
        alias: "launch url",
    },
];

export const defaultAction: PartialAction = {
    id: "",
    name: defaultTranslatableModel("name"),
    description: defaultTranslatableModel("description"),
    icon: "",
    iconLocation: "",
    backgroundColor: "#276696",
    fontColor: "#ffffff",
    textAlignment: "left",
    type: "app",
    dhisVersionRange: "",
    dhisAppKey: "",
    dhisLaunchUrl: "",
    dhisAuthorities: [],
    disabled: false,
};

export const getPageActions = (
    isRoot: boolean,
    showAllActions: boolean,
    actions: Action[],
    user: User,
    currentPageActions: Action[]
) => {
    if (isRoot && showAllActions) {
        return actions.map(({ id }) => id);
    } else if (user) {
        return currentPageActions
            .filter(action => {
                const actionUsers = action.userAccesses?.map(userAccess => userAccess.id) ?? [];
                const actionUserGroups = action.userGroupAccesses?.map(userGroupAccess => userGroupAccess.id) ?? [];
                const userGroupIds = user.userGroups.map(userGroup => userGroup.id);

                const hasUserAccess = actionUsers.includes(user.id);
                const hasUserGroupAccess = _.intersection(actionUserGroups, userGroupIds).length > 0;
                const hasPublicAccess = action.publicAccess !== "--------";

                return hasUserAccess || hasUserGroupAccess || hasPublicAccess;
            })
            .map(({ id }) => id);
    } else {
        return [];
    }
};
