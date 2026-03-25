import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';

@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.scss'],
    standalone: true,
    imports: [
        TranslatePipe,
        AlgoIconComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent {
    @Input() colorTheme: 'dark' | 'light' = 'dark';
    @Input() text: string = '';
    @Input() enabled: boolean = false;
    @Input() blocked: boolean = false;
    @Input() blockedWhenEnabled: boolean | null = null;
    @Input() blockedWhenNotEnabled: boolean | null = null;
    @Input() iconLeft: string = '';
    @Input() iconRight: string = '';
    @Output() enabledChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private _cd: ChangeDetectorRef) {}

    public toggle() {
        if (this.isActuallyDisabled()) {
            return;
        }

        this.enabled = !this.enabled;
        this.enabledChange.emit(this.enabled);
        this._cd.markForCheck();
    }

    public isActuallyDisabled(): boolean {
        if (this.blocked) {
            return true;
        } else if (this.enabled && this.blockedWhenEnabled) {
            return true;
        } else if (!this.enabled && this.blockedWhenNotEnabled) {
            return true;
        } else {
            return false;
        }
    }
}
