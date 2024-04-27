import _ from "lodash";
import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";
import { TranslatableText } from "../entities/TranslatableText";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";
import { extractTranslations } from "./common";

export class ImportLandingNodesTranslationsUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(lang: string, terms: Record<string, string>, key: string): Promise<number> {
        const persisted = await this.landingNodeRepository.getPersistedLandingPages();

        const translate = <T extends TranslatableText>(item: T, language: string, term: string | undefined): T => {
            if (term === undefined) {
                return item;
            } else if (language === "en") {
                return { ...item, referenceValue: term };
            } else {
                return { ...item, translations: { ...item.translations, [language]: term } };
            }
        };

        const toTranslate = persisted.find(model => model.find(item => item.id === key));
        if (!toTranslate) throw new Error(`Unable to load landing pages`);

        const translatedModels: PersistedLandingNode[] = toTranslate.map(model => ({
            ...model,
            name: translate(model.name, lang, terms[model.name.key]),
            title: model.title ? translate(model.title, lang, terms[model.title.key]) : undefined,
            content: model.content ? translate(model.content, lang, terms[model.content.key]) : undefined,
        }));

        const updatedLandingNodes = persisted.map(model => {
            const shouldReplace = model.some(obj => translatedModels.map(obj => obj.id).includes(obj.id));
            return shouldReplace ? translatedModels : model;
        });

        await this.landingNodeRepository.save(updatedLandingNodes);

        const translations = await extractTranslations(translatedModels);

        return _.intersection(_.keys(translations["en"]), _.keys(terms)).length;
    }
}
