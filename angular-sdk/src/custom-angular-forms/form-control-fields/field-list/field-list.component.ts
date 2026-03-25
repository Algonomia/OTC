import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {
    ListFormControlComponent
} from '../../../design-elements/form-controls/list-form-control/list-form-control.component';
import {SelectHandler} from '../../../handlers/select-handler/select-handler';
import {MetaFormControl} from '../../metaforms';
import {AlgoMultiListValidator, LanguagesUtils, ListMeta, NullUndefinedUtils} from '@algonomia/ts-shared';
import {TranslateService} from '@ngx-translate/core';
import {CountriesService} from '../../../global-services/countries.service';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

@Component({
  selector: 'app-field-list',
    imports: [
        ListFormControlComponent
    ],
  templateUrl: './field-list.component.html',
  styleUrl: './field-list.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldListComponent<T, ID> {
    @Input() set formControl(formControl: MetaFormControl<T | T[] | null, ListMeta<T, ID>>) {
        this.__formControl = formControl;
        this.__multiple = formControl?.algoValidator?.validator_type === 'multi_qcm';
        this.__selectHandler = this._getSelectHandler(formControl);
        this._cd.markForCheck();
    }

    private _getSelectHandler(formControl: MetaFormControl<T | T[] | null, ListMeta<T, ID>>) {
        const listMeta = formControl?.algoValidator?.meta;
        const list = listMeta?.list ?? [];
        const idCallback = listMeta?.idCallback;
        const textCallback = this._formatTextCallback(listMeta, listMeta?.textCallback);
        const init: T[] =  [formControl?.value].flat(1).filter(x => !isNullOrUndefined(x)) as T[];

        if (this.__multiple) {
            return SelectHandler.getMultiSelectHandler([...list], [], init, idCallback, textCallback);
        } else {
            return SelectHandler.getMonoSelectHandler([...list], [], init, idCallback, textCallback);
        }
    }

    private _formatTextCallback(listMeta: ListMeta<T, ID>, textCallback?: (x: T) => string) {
        if (!listMeta.translate) {
            return textCallback;
        }
        if (listMeta.isLang) {
            return ((x: T) => {
                const currentLang = this._translate.currentLang;
                const brutResult = textCallback ? textCallback(x) : <string>x;
                return LanguagesUtils.getLanguageName(brutResult, currentLang);
            }).bind(this);
        } else if (listMeta.isCountryIso) {
            return ((x: T) => {
                const brutResult = textCallback ? textCallback(x) : <string>x;
                return CountriesService.getName(brutResult, this._translate.currentLang);
            }).bind(this);
        }
        return ((x: T) => {
            const brutResult = textCallback ? textCallback(x) : <string>x;
            return this._translate.instant(brutResult);
        }).bind(this);
    }

    protected __selectHandler!: SelectHandler<T, ID>;
    protected __multiple = false;
    protected __formControl!: MetaFormControl<T | T[] | null, ListMeta<T, ID>>;
    constructor(private _cd: ChangeDetectorRef, private _translate: TranslateService) {}
}
