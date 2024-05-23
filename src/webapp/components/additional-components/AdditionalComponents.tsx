import React from "react";
import { useConfig } from "../../pages/settings/useConfig";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import { LandingParagraph } from "../landing-layout";
import { useAnalytics } from "../../hooks/useAnalytics";
import { Action, getPageActions } from "../../../domain/entities/Action";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";

export const AdditionalComponents: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
    openPage(page: LandingNode): void;
}> = React.memo(props => {
    const { isRoot, currentPage, openPage } = props;
    const { actions, translate, launchAppBaseUrl, getLandingNodeById } = useAppContext();
    const { showAllActions, user } = useConfig();
    const analytics = useAnalytics();
    const snackbar = useSnackbar();

    const actionHandleClick = React.useCallback(
        (action: Action) => {
            switch (action.type) {
                case "app":
                    {
                        const name = translate(action.name);
                        const isAbsolute =
                            action.dhisLaunchUrl.indexOf("http://") === 0 ||
                            action.dhisLaunchUrl.indexOf("https://") === 0;
                        const href = isAbsolute
                            ? `${action.dhisLaunchUrl}`
                            : `${launchAppBaseUrl}${action.dhisLaunchUrl}`;

                        analytics.sendPageView({ title: name, location: href });
                        window.location.href = href;
                    }
                    break;
                case "page":
                    {
                        const page = getLandingNodeById(action.launchPageId);
                        if (!page) {
                            snackbar.error(i18n.t("Page not found"));
                            return;
                        }
                        if (currentPage.id === page.id) {
                            snackbar.error(i18n.t("You are already on this page."));
                            return;
                        }
                        openPage(page);
                    }
                    break;
            }
        },
        [analytics, getLandingNodeById, launchAppBaseUrl, openPage, snackbar, translate, currentPage]
    );

    const currentPageActions = actions.filter(action => currentPage.actions.includes(action.id));
    const pageActions = user && getPageActions(isRoot, showAllActions, actions, user, currentPageActions);

    const rowSize = actions.length % 3 ? 3 : 4;

    return (
        <React.Fragment>
            {isRoot && showAllActions && pageActions?.length !== 0 ? (
                <LandingParagraph size={28} align={"left"}>
                    {i18n.t("Available actions:")}
                </LandingParagraph>
            ) : null}

            <Cardboard rowSize={rowSize} key={`group-${currentPage.id}`}>
                {pageActions?.map(actionId => {
                    const action = actions.find(({ id }) => id === actionId);
                    if (!action || !action.compatible) return null;

                    const name = translate(action.name);
                    const description = translate(action.description);

                    return (
                        <BigCard
                            key={`card-${actionId}`}
                            label={name}
                            onClick={() => actionHandleClick(action)}
                            disabled={action?.disabled}
                            icon={action?.icon ? <img src={action.icon} alt={`Icon for ${name}`} /> : undefined}
                            iconLocation={action?.iconLocation}
                            iconSize={currentPage.iconSize}
                            description={description}
                            backgroundColor={action?.backgroundColor}
                            fontColor={action?.fontColor}
                            textAlignment={action?.textAlignment}
                        />
                    );
                })}
            </Cardboard>
        </React.Fragment>
    );
});
