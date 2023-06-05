import { useConfig } from "../../pages/settings/useConfig";
import i18n from "@eyeseetea/d2-ui-components/locales";
import React from "react";
import { LandingNode } from "../../../domain/entities/LandingNode";
import { useAppContext } from "../../contexts/app-context";
import { BigCard } from "../card-board/BigCard";
import { Cardboard } from "../card-board/Cardboard";
import { LandingParagraph } from "../landing-layout";
import { getPageActions } from "../../../domain/entities/Action";

export const AdditionalComponents: React.FC<{
    isRoot: boolean;
    currentPage: LandingNode;
}> = ({ isRoot, currentPage }) => {
    const { actions, translate, launchAppBaseUrl } = useAppContext();

    const { showAllActions, user } = useConfig();

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

                    const handleClick = () => {
                        if (
                            action.dhisLaunchUrl.indexOf("http://") === 0 ||
                            action.dhisLaunchUrl.indexOf("https://") === 0
                        )
                            window.location.href = `${action.dhisLaunchUrl}`;
                        else window.location.href = `${launchAppBaseUrl}${action.dhisLaunchUrl}`;
                    };

                    const name = translate(action.name);

                    return (
                        <BigCard
                            key={`card-${actionId}`}
                            label={name}
                            onClick={handleClick}
                            disabled={action?.disabled}
                            icon={action?.icon ? <img src={action.icon} alt={`Icon for ${name}`} /> : undefined}
                            iconLocation={action?.iconLocation}
                            backgroundColor={action?.backgroundColor}
                            fontColor={action?.fontColor}
                            textAlignment={action?.textAlignment}
                        />
                    );
                })}
            </Cardboard>
        </React.Fragment>
    );
};
