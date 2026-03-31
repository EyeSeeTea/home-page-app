import _ from "lodash";
import { Action, PartialAction } from "../entities/Action";
import { TranslatableText } from "../entities/TranslatableText";
import { User } from "../entities/User";

export const updateTranslation = (
    action: PartialAction,
    key: string,
    value: string,
    modelType: "name" | "description",
    language?: string
): PartialAction => {
    const translate = (text: TranslatableText): TranslatableText => {
        if (key !== text.key) return text;

        return !language
            ? { ...text, referenceValue: value }
            : { ...text, translations: { ...text.translations, [language]: value } };
    };

    return {
        ...action,
        name: modelType === "name" ? translate(action.name) : action.name,
        description: modelType === "description" ? translate(action.description) : action.description,
    };
};

export function getUserActions(actions: Action[], user: User): string[] {
    return actions
        .filter(action => {
            const actionUsers = action.userAccesses?.map(userAccess => userAccess.id) ?? [];
            const actionUserGroups = action.userGroupAccesses?.map(userGroupAccess => userGroupAccess.id) ?? [];
            const userGroupIds = user.userGroups.map(userGroup => userGroup.id);

            const hasUserAccess = actionUsers.includes(user.id);
            const hasUserGroupAccess = _.intersection(actionUserGroups, userGroupIds).length > 0;
            const hasPublicAccess = Boolean(action.publicAccess) && action.publicAccess !== "--------";

            return hasUserAccess || hasUserGroupAccess || hasPublicAccess;
        })
        .map(({ id }) => id);
}

export const getPageActions = (
    isRoot: boolean,
    showAllActions: boolean,
    actions: Action[],
    user: User,
    currentPageActions: Action[]
): string[] => {
    if (isRoot && showAllActions) {
        return actions.map(({ id }) => id);
    } else if (user) {
        return getUserActions(currentPageActions, user);
    } else {
        return [];
    }
};
