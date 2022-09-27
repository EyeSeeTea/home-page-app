import { PartialAction } from "../entities/Action";
import { TranslatableText } from "../entities/TranslatableText";

export const updateTranslation = (
    action: PartialAction,
    key: string,
    value: string,
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
        name: translate(action.name),
    };
};
