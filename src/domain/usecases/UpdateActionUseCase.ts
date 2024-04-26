import i18n from "../../locales";
import { PartialAction } from "../entities/Action";
import { ActionRepository } from "../repositories/ActionRepository";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";

export class UpdateActionUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository, private landingRepository: LandingNodeRepository) {}

    public async execute(action: PartialAction): Promise<void> {
        if (action.type !== "page") return this.actionRepository.update(action);
        const landing = await this.landingRepository.getById(action.launchPageId);
        if (!landing) return Promise.reject(i18n.t("Landing page not found"));
        if (landing.actions.some(actionId => actionId === action.id))
            return Promise.reject(i18n.t("Landing page cannot have an action to launch the landing page itself"));
        else return this.actionRepository.update(action);
    }
}
