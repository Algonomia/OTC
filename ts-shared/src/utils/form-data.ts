import {NullUndefinedUtils} from './null-undefined';

export namespace FormDataUtils {
    import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

    export function toFormData(obj: any) {
        const formData = new FormData();
        Object.keys(obj).forEach(k => {
            const value: any = obj[k];
            if (Array.isArray(value)) {
                value.forEach(v => {
                    formData.append(k, v);
                });
            } else if (!isNullOrUndefined(value)) {
                formData.append(k, value);
            }
        });
        return formData;
    }
}
