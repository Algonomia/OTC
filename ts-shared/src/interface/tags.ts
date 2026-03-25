import {EBaseTypes} from './complex-value.interface';

export interface ITag {
    code: string;
    viewValue: string;
    expected_type: EBaseTypes;
}

export interface IScope {
    code: string;
    viewValue: string;
}

export namespace TagUtils {
    export function getViewValueFromCode<T extends ITag | IScope>(list: T[], code?: string | null) {
        if (!code) {
            return '';
        }
        return list.find(x => x.code === code)?.viewValue ?? code ?? '';
    }
}
