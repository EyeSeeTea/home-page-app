import _ from "lodash";
import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { setTranslationValue } from "../entities/TranslatableText";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";
import { extractLandingNodeTranslations } from "./helpers/TranslationService";

export class ImportLandingNodesTranslationsUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(language: string, terms: Record<string, string>, key: string): Promise<number> {
        const persisted = await this.landingNodeRepository.getPersistedLandingPages();

        const toTranslate = persisted.find(model => model.find(item => item.id === key));
        if (!toTranslate) throw new Error(`Unable to load landing pages`);

        const translatedModels: PersistedLandingNode[] = toTranslate.map(model => ({
            ...model,
            name: setTranslationValue({ item: model.name, language, term: terms[model.name.key] }),
            title: model.title
                ? setTranslationValue({ item: model.title, language, term: terms[model.title.key] })
                : undefined,
            content: model.content
                ? setTranslationValue({ item: model.content, language, term: terms[model.content.key] })
                : undefined,
        }));

        const updatedLandingNodes = persisted.map(model => {
            const shouldReplace = model.some(obj => translatedModels.map(obj => obj.id).includes(obj.id));
            return shouldReplace ? translatedModels : model;
        });

        await this.landingNodeRepository.save(updatedLandingNodes);

        const translations = extractLandingNodeTranslations(translatedModels);

        return _.intersection(_.keys(translations["en"]), _.keys(terms)).length;
    }
}
