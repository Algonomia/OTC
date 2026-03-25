import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MultiMetaFormControlComponent} from '../multi-meta-form-control/multi-meta-form-control.component';
import {MetaFormControl, MetaFormGroup} from '../metaforms';

@Component({
  selector: 'app-meta-form-group',
    imports: [
        ReactiveFormsModule,
        MultiMetaFormControlComponent
    ],
  templateUrl: './meta-form-group.component.html',
  styleUrl: './meta-form-group.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetaFormGroupComponent implements OnChanges {
    @Input() metaFormGroup!: MetaFormGroup;
    @Input() keys: string[] = [];
    @Input() masks?: string[] = [];
    @Input() hide_optionals: boolean = false;

    constructor(private _cd: ChangeDetectorRef) {}

    protected __metaFormControls: MetaFormControl<any, any>[] = [];

    ngOnChanges() {
        const keys = this.keys?.length > 0 ? this.keys : (Object.keys(this.metaFormGroup.controls));
        const filteredKeys = keys.filter(key => !(this.masks ?? []).includes(key));
        this.__metaFormControls = filteredKeys.map(k => {
            return this.metaFormGroup.get(k) as MetaFormControl<any, any>;
        });
        this._cd.markForCheck();
    }
}
