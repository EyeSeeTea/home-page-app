import _ from "lodash";
import { useMemo } from "react";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { getUserActions } from "../../../domain/helpers/ActionHelpers";
import { useAppContext } from "../../contexts/app-context";
import { useConfig } from "../../pages/settings/useConfig";
import { getNumberActionsToShowPerRow } from "../../utils/cards";

interface UseItemRootResult {
    isSinglePage: boolean;
    landingRowSize: number;
    childrenRowSize: number;
}

export function useItemRoot(currentPage: LandingNode): UseItemRootResult {
    const { actions } = useAppContext();
    const { user } = useConfig();

    const isSinglePage = currentPage.pageRendering === "single";

    const landingRowSize = useMemo(() => {
        if (!user || !isSinglePage) return 0;

        if (currentPage.landingRowSize) return currentPage.landingRowSize;

        const childrenActionIds = new Set([
            ..._(currentPage.children)
                .flatMap(child => child.actions)
                .value(),
            ...currentPage.actions,
        ]);
        const allChildrenActions = actions.filter(action => childrenActionIds.has(action.id));
        const visibleActions = getUserActions(allChildrenActions, user);
        return getNumberActionsToShowPerRow(visibleActions.length);
    }, [user, actions, currentPage, isSinglePage]);

    const childrenRowSize = getNumberActionsToShowPerRow(currentPage.children.length);

    return { isSinglePage, landingRowSize, childrenRowSize };
}
