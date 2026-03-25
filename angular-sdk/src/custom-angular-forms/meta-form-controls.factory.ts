import {
    AlgoBrowserFileValidator, AlgoMonoListValidator, AlgoMultiListValidator,
    AlgoStringValidator, AValidator, FileMeta, ListMeta,
    StringMeta
} from '@algonomia/ts-shared';
import {MetaFormControl} from './metaforms';
import {BaseMeta} from '@algonomia/ts-shared';

export class MetaFormControlFactory {
    static createStringFormControl(stringMeta: StringMeta, initial: string | null = null) {
        const algoValidator = new AlgoStringValidator(stringMeta);
        return this.createMetaFormControl(algoValidator, initial);
    }

    static createFileFormControl(meta: FileMeta, initial: File[] = []) {
        const algoValidator = new AlgoBrowserFileValidator(meta);
        return this.createMetaFormControl(algoValidator, initial);
    }

    static createMonolistFormControl<T, ID>(meta: ListMeta<T, ID>, initial: T | null = null) {
        const algoValidator = new AlgoMonoListValidator<T, ID>(meta);
        return this.createMetaFormControl(algoValidator, initial);
    }

    static createMultilistFormControl<T, ID>(meta: ListMeta<T, ID>, initial: T[] = []) {
        const algoValidator = new AlgoMultiListValidator<T, ID>(meta);
        return this.createMetaFormControl(algoValidator, initial);
    }

    static createMetaFormControl<T, M extends BaseMeta>(validator: AValidator<T, M>, initial?: T | null) {
        return new MetaFormControl(validator, initial);
    }
}


