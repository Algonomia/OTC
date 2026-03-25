import { z } from 'zod';

export namespace LanguagesUtils {
    const SUPPORTED_LANGUAGES: ReadonlyArray<string> = [
        'af', 'sq', 'am', 'ar', 'hy', 'bn', 'bs', 'ca', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr',
        'de', 'el', 'gu', 'hi', 'hu', 'is', 'it', 'ja', 'jw', 'kn', 'km', 'ko', 'la', 'lv', 'ml', 'mr', 'ne', 'pl',
        'pt', 'pa', 'ro', 'ru', 'sr', 'si', 'sk', 'sl', 'es', 'su', 'sw', 'sv', 'ta', 'te', 'tr', 'uk', 'ur', 'vi',
        'cy', 'xh', 'yi', 'zu', 'az', 'bg', 'dv', 'ga', 'he', 'id', 'ka', 'lt', 'mg', 'mi', 'mn', 'ms', 'no', 'rw',
        'th', 'tn', 'zh'
    ];

    export const LangStringSchema = z.string().refine(val => SUPPORTED_LANGUAGES.includes(val), {
        message: 'Language not supported',
    });

    export function getAllLanguages() {
        return [...SUPPORTED_LANGUAGES];
    }

    export const getLanguageName = (code: string, lang: string = 'en'): string => {
        if (!SUPPORTED_LANGUAGES.includes(code)) {
            return code;
        }
        const dn = new Intl.DisplayNames(lang, { type: 'language' });
        const name = dn.of(code);
        if (name) {
            return name[0].toUpperCase() + name.slice(1);
        }
        return code;
    };
}
