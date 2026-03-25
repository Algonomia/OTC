import {AValidator} from '../../validators.abstract';
import {ListMeta, listValueRequired, restrictToList} from './common';
import {EValidatorType} from '../../EValidatorType';

export class AlgoMonoListValidator<T, ID> extends AValidator<T | null, ListMeta<T, ID>> {
    readonly validator_type = EValidatorType.qcm;

    constructor(meta: ListMeta<T, ID> = {list: []}) {
        super(meta);

        if (meta.required) {
            this.errorCallbacks.push(listValueRequired);
        }
        this.errorCallbacks.push(restrictToList.bind(this, meta.list as T[]));
    }
}
