import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {IStringConstant} from '@algonomia/ts-shared';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-constant-string',
    imports: [
        FormsModule
    ],
  templateUrl: './edit-constant-string.component.html',
  styleUrl: './edit-constant-string.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConstantStringComponent {
    @Input() stringComplexValue!: IStringConstant;

    constructor(private _cd: ChangeDetectorRef) {}

    changeValue(event: any) {
        this.stringComplexValue.value = (event.target as HTMLInputElement)?.value;
        this._cd.markForCheck();
    }
}
