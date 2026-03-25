import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ESelectionMode, SelectHandler} from '../../../handlers/select-handler/select-handler';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {AsyncPipe} from '@angular/common';
import {SelectedPipe} from '../../../handlers/select-handler/pipes/selected.pipe';

@Component({
  selector: 'app-single-select-box',
    imports: [
        AlgoIconComponent,
        AsyncPipe,
        SelectedPipe
    ],
  templateUrl: './single-select-box.component.html',
  styleUrl: './single-select-box.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleSelectBoxComponent<T, ID> {
    @Input() selectHandler?: SelectHandler<T, ID> | null;
    @Input() item?: T;
    @Input() disabled = false;
    @Input() colorTheme: 'dark' | 'light' = 'dark';

    onClick(event: Event) {
        if (this.disabled || this.item === undefined) {
            return;
        }
        this.selectHandler?.switch(this.item);
        event.stopPropagation();
    }

    protected readonly ESelectionMode = ESelectionMode;
}
