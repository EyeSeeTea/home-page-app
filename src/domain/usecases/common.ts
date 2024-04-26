import _ from "lodash";
import { PersistedLandingNode } from "../../data/entities/PersistedLandingNode";

export async function extractTranslations(
    models: PersistedLandingNode[]
): Promise<Record<string, Record<string, string>>> {
    const texts = _.flatMap(models, model => _.compact([model.name, model.title, model.content]));

    const referenceStrings = _.fromPairs(texts.map(({ key, referenceValue }) => [key, referenceValue]));
    const translatedStrings = _(texts)
        .flatMap(({ key, translations }) => _.toPairs(translations).map(([lang, value]) => ({ lang, key, value })))
        .groupBy("lang")
        .mapValues(array => _.fromPairs(array.map(({ key, value }) => [key, value])))
        .value();

    return { ...translatedStrings, en: referenceStrings };
}
