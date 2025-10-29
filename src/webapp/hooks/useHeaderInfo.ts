import { LandingNode } from "../../domain/entities/LandingNode";
import { useAppContext } from "../contexts/app-context";

export function useHeaderInfo(currentPage: LandingNode) {
    const { translate } = useAppContext();

    const title = currentPage.title?.referenceValue.trim() ? translate(currentPage.title) : undefined;
    const showHeader = currentPage.icon || title;

    return {
        title,
        showHeader,
    };
}
