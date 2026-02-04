import { GetSchemaType, Schema } from "../../utils/codec";

export const TranslatableTextModel = Schema.object({
    key: Schema.string,
    referenceValue: Schema.string,
    translations: Schema.dictionary(Schema.string, Schema.string),
});

export type TranslatableText = GetSchemaType<typeof TranslatableTextModel>;

export const buildTranslate = (locale: string): TranslateMethod => {
    return (text: TranslatableText): string => {
        const translations = text.translations ?? {};
        return translations[locale] || text.referenceValue;
    };
};

export type TranslateMethod = (string: TranslatableText) => string;

export type Translations = Record<string, string>;

type TranslateProps<T> = {
    item: T;
    language: string;
    term: string | undefined;
};
export function setTranslationValue<T extends TranslatableText>({ item, language, term }: TranslateProps<T>): T {
    if (term === undefined) {
        return item;
    } else if (language === "en") {
        return { ...item, referenceValue: term };
    } else {
        return { ...item, translations: { ...item.translations, [language]: term } };
    }
}
