import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges} from '@angular/core';

@Component({
  selector: 'app-completion-bar',
  imports: [],
  templateUrl: './completion-bar.component.html',
  styleUrl: './completion-bar.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompletionBarComponent implements OnChanges {
    @Input() completion: number = 0;

    constructor(private _cd: ChangeDetectorRef) {}

    ngOnChanges() {
        this._cd.markForCheck();
    }
}
