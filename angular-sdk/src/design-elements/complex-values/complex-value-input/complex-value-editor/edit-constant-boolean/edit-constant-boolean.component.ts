import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, OnInit} from '@angular/core';
import {SelectHandler} from '../../../../../handlers/select-handler/select-handler';
import {IBooleanConstant} from '@algonomia/ts-shared';
import {StdMenuComponent} from '../../../../menus/std-menu/std-menu.component';
import {TranslatePipe} from '@ngx-translate/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {skip, switchMap, tap} from 'rxjs';
import {ATemplateComponent} from '../../../../../templates/template-component.abstract';

@Component({
  selector: 'app-edit-constant-boolean',
    imports: [
        StdMenuComponent,
        TranslatePipe
    ],
  templateUrl: './edit-constant-boolean.component.html',
  styleUrl: './edit-constant-boolean.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConstantBooleanComponent extends ATemplateComponent implements OnInit {
    boolComplexValue = input<IBooleanConstant>();
    boolComplexValue$ = toObservable(this.boolComplexValue);

    protected __boolSelectHandler = SelectHandler.getMonoSelectHandler(
        [true, false], [], [], undefined, ((x: boolean) => x ? 'True' : 'False')
    );

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this.boolComplexValue$).pipe(
            tap(_ => {
                const value = this.boolComplexValue()?.value;
                if (value !== true && value !== false) {
                    this.__boolSelectHandler.removeAll();
                } else {
                    this.__boolSelectHandler.add(value);
                }
                this._cd.markForCheck();
            }),
            switchMap(_ => this.__boolSelectHandler!?.firstSelected$),
            skip(1)
        ).subscribe(selected => {
            const complexValue = this.boolComplexValue();
            if (!complexValue) {
                return;
            }
            complexValue.value = selected ?? false;
            this._cd.markForCheck();
        });
    }
}
