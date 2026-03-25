import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, input, Input, OnInit} from '@angular/core';
import {DimensionsUtil, IDimension, INumericConstant, IUnit} from '@algonomia/ts-shared';
import {FormsModule} from '@angular/forms';
import {SelectHandler} from '../../../../../handlers/select-handler/select-handler';
import {ATemplateComponent} from '../../../../../templates/template-component.abstract';
import {StdMenuComponent} from '../../../../menus/std-menu/std-menu.component';
import {TranslatePipe} from '@ngx-translate/core';
import {share, skip, switchMap, tap} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit-constant-numeric',
    imports: [
        FormsModule,
        StdMenuComponent,
        TranslatePipe
    ],
  templateUrl: './edit-constant-numeric.component.html',
  styleUrl: './edit-constant-numeric.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConstantNumericComponent extends ATemplateComponent implements OnInit {
    numComplexValue = input<INumericConstant>();
    numComplexValue$ = toObservable(this.numComplexValue);

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    protected __dimSelectHandler: SelectHandler<IDimension, string> = SelectHandler.getAlwaysOneSelectHandler(
        DimensionsUtil.getAllDimensions(), [], [], (x => x.code), (x => x.name)
    );
    protected __unitSelectHandler: SelectHandler<IUnit, string> = SelectHandler.getAlwaysOneSelectHandler(
        [] as IUnit[], [], [], (x => x.code), (x => x.code ?? '')
    );

    protected __unitLength = 0;

    ngOnInit() {
        const onChangeComplexValue$ = this.pipeTakeUntil(this.numComplexValue$).pipe(
            tap(complexValue => {
                this._initDimSelection(complexValue?.dimension);
                this._initUnitSelection(complexValue?.unit);
            }),
            share()
        );

        this.__dimSelectHandler.firstSelected$.subscribe(dim => {
            const units = dim?.unit_list ?? [];
            this.__unitLength = units.length;
            this.__unitSelectHandler.changeList(units);
        });

        onChangeComplexValue$.pipe(
            switchMap(_ => this.__dimSelectHandler.firstSelected$),
            skip(1)
        ).subscribe(dim => {
            this.changeDimension(dim);
        });

        onChangeComplexValue$.pipe(
            switchMap(_ => this.__unitSelectHandler.firstSelected$),
            skip(1)
        ).subscribe(unit => {
            this.changeUnit(unit);
        });
    }

    private _initDimSelection(selectedDimCode?: string | null) {
        const selectedDim = this.__dimSelectHandler.list.find(x => {
            return x.code === selectedDimCode;
        });
        if (!selectedDim) {
            this.__dimSelectHandler.removeAll();
        } else {
            this.__dimSelectHandler.add(selectedDim);
        }
    }

    private _initUnitSelection(selectedUnitCode?: string | null) {
        const selectedUnit = this.__unitSelectHandler.list.find(x => {
            return x.code === selectedUnitCode;
        });
        if (!selectedUnit) {
            this.__unitSelectHandler.removeAll();
        } else {
            this.__unitSelectHandler.add(selectedUnit);
        }
    }

    changeValue(event: any) {
        const complexValueRef = this.numComplexValue()
        if (!complexValueRef) {
            return;
        }
        complexValueRef.value = Number((event.target as HTMLInputElement)?.value);
        this._cd.markForCheck();
    }

    changeDimension(dimension?: IDimension) {
        const complexValueRef = this.numComplexValue()
        if (!complexValueRef) {
            return;
        }
        complexValueRef.dimension = dimension?.code;
        this._cd.markForCheck();
    }

    changeUnit(unit?: IUnit) {
        const complexValueRef = this.numComplexValue()
        if (!complexValueRef) {
            return;
        }
        complexValueRef.unit = unit?.code;
        this._cd.markForCheck();
    }
}
