import * as countries from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import en from 'i18n-iso-countries/langs/en.json';
import {Alpha2Code} from 'i18n-iso-countries';


countries.registerLocale(fr);
countries.registerLocale(en);

export class CountriesUtils {
    static get iso2List() {
        return Array.from(Object.keys(countries.getAlpha2Codes()));
    }

    static get iso2Set() {
        return new Set(this.iso2List);
    }

    static getName(iso2: string, lang: string) {
        return countries.getName(iso2 as Alpha2Code, lang) ?? '';
    }

    static containsAll(list_iso2: string[]) {
        if (CountriesUtils.iso2List.length !== list_iso2.length) {
            return false;
        }
        const iso2Set = this.iso2Set;
        return list_iso2.every(x => iso2Set.has(x));
    }
}
