import { PartialAction } from "../entities/Action";
import { TranslatableText } from "../entities/TranslatableText";

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
