import _ from "lodash";
import { TranslatableText, Translations } from "../../entities/TranslatableText";
import { Notification } from "../../entities/Notification";
import { PersistedLandingNode } from "../../../data/entities/PersistedLandingNode";

type Language = string;
export type TranslationMap = Record<Language, Translations>;

//{lang: {key: translatedText}}

export function extractLandingNodeTranslations(models: PersistedLandingNode[]): TranslationMap {
    const texts = _.flatMap(models, model => _.compact([model.name, model.title, model.content]));

    return buildTranslationMap(texts);
}

export function extractNotificationTranslations(models: Notification[]): TranslationMap {
    const texts = _.flatMap(models, model => _.compact([model.content]));
    return buildTranslationMap(texts);
}

function buildTranslationMap(texts: TranslatableText[]): TranslationMap {
    const referenceStrings = _.fromPairs(texts.map(({ key, referenceValue }) => [key, referenceValue]));
    const translatedStrings = _(texts)
        .flatMap(({ key, translations }) => _.toPairs(translations).map(([lang, value]) => ({ lang, key, value })))
        .groupBy(({ lang }) => lang)
        .mapValues(array => _.fromPairs(array.map(({ key, value }) => [key, value])))
        .value();

    return { ...translatedStrings, en: referenceStrings };
}
