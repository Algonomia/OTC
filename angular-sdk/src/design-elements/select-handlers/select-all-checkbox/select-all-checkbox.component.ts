import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SelectHandler, SelectionState} from '../../../handlers/select-handler/select-handler';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {SelectedStatePipe} from '../../../handlers/select-handler/pipes/selected-state.pipe';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-select-all-checkbox',
    imports: [
        AlgoIconComponent,
        SelectedStatePipe,
        AsyncPipe
    ],
  templateUrl: './select-all-checkbox.component.html',
  styleUrl: './select-all-checkbox.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectAllCheckboxComponent<T, ID> {
    @Input() selectHandler?: SelectHandler<T, ID> | null;
    @Input() disabled = false;
    @Input() colorTheme: 'dark' | 'light' = 'dark';
    protected readonly SelectionState = SelectionState;
}
