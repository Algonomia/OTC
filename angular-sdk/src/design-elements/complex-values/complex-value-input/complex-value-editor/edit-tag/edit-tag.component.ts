import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, input, OnInit} from '@angular/core';
import {IScope, ITagValue, TagUtils} from '@algonomia/ts-shared';
import {toObservable} from '@angular/core/rxjs-interop';
import {SelectHandler} from '../../../../../handlers/select-handler/select-handler';
import {switchMap, tap} from 'rxjs';
import {ATemplateComponent} from '../../../../../templates/template-component.abstract';
import {FormsModule} from '@angular/forms';
import {StdMenuComponent} from '../../../../menus/std-menu/std-menu.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-edit-tag',
    imports: [
        FormsModule,
        StdMenuComponent,
        TranslatePipe
    ],
  templateUrl: './edit-tag.component.html',
  styleUrl: './edit-tag.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class EditTagComponent extends ATemplateComponent implements OnInit {
    scopeList = input<IScope[]>([]);
    scopeList$ = toObservable(this.scopeList);
    complexValue = input<Partial<ITagValue>>({});
    complexValue$ = toObservable(this.complexValue);

    scopeListNotEmpty = computed(() => this.scopeList()?.length > 0);

    protected __scopeSelectHandler?: SelectHandler<string, string>;

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.pipeTakeUntil(this.complexValue$).pipe(
            switchMap(_ => this.scopeList$),
            tap(_ => {
                this.__scopeSelectHandler = SelectHandler.getMonoSelectHandler(
                    this.scopeList().map(x => x.code),
                    undefined,
                    !!this.complexValue().scope ? [this.complexValue().scope!] : [],
                    undefined,
                    TagUtils.getViewValueFromCode.bind(this, this.scopeList())
                );
                this._cd.markForCheck();
            }),
            switchMap(_ => this.__scopeSelectHandler!?.firstSelected$)
        ).subscribe(selected => {
            this.complexValue().scope = selected;
            this._cd.markForCheck();
        });
    }

    changeYearsAgo(event: any) {
        const complexValueRef = this.complexValue();
        if (!complexValueRef) {
            return;
        }
        complexValueRef.years_ago = Number((event.target as HTMLInputElement)?.value);
        this._cd.markForCheck();
    }
}
