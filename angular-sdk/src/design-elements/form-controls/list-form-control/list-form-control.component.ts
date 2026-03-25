import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {FormControlTemplateComponent} from '../common/form-control-template/form-control-template.component';
import {ATemplateComponent} from '../../../templates/template-component.abstract';
import {FormControl} from '@angular/forms';
import {SelectHandler} from '../../../handlers/select-handler/select-handler';
import {switchMap, tap} from 'rxjs';
import {NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {
    StdMenuOverlayAdaptiveComponent
} from '../../menus/std-menu-overlay-adaptive/std-menu-overlay-adaptive.component';

@Component({
    selector: 'app-list-form-control',
    imports: [
        TranslatePipe,
        FormControlTemplateComponent,
        StdMenuOverlayAdaptiveComponent,
    ],
    templateUrl: './list-form-control.component.html',
    styleUrl: './list-form-control.component.css',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListFormControlComponent<T, ID> extends ATemplateComponent implements OnInit {
    @Input() formControl!: FormControl<T | T[] | null>;
    @Input() selectHandler!: SelectHandler<T, ID>;
    @Input() multiple?: boolean;
    @Input() label?: string;
    @Input() required?: boolean;
    @Input() emptySelectionIsNull?: boolean;
    @Input() placeholder?: string;

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this.selectHandler.selected$.pipe(
            tap((selected: T[]) => {
                if (this._formControlAndSelectHandlerAligned()) {
                    return;
                }
                this._setSelected(selected);
            }),
            switchMap(_ => this.formControl.valueChanges)
        )).subscribe((selected: T[] | T | null) => {
            if (this._formControlAndSelectHandlerAligned()) {
                return;
            }
            const selectedArr: T[] = [selected].flat(1).filter(x => !isNullOrUndefined(x)) as T[];
            this.selectHandler.replaceAll(selectedArr);
        });
    }

    private _formControlAndSelectHandlerAligned() {
        const formControlValues: T[] = [this.formControl.value].filter(x => !isNullOrUndefined(x)).flat() as T[];
        return this.selectHandler.allSelectedStrict(formControlValues);
    }

    private _setSelected(selected: T[]) {
        if (this.multiple) {
            if (this.emptySelectionIsNull && selected.length === 0) {
                this.formControl.setValue(null);
            } else {
                this.formControl.setValue(selected);
            }
        } else {
            this.formControl.setValue(selected[0]);
        }
        this.formControl.markAsTouched();
        this._cd.markForCheck();
    }
}
