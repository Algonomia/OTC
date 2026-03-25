import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {
    BasicFormatterWithTranslate,
    SimpleNotifBroadcaster, WarnLevel
} from '../notification-handler/notification-handler.service';

@Component({
    selector: 'app-clipboard-field',
    templateUrl: './clipboard-field.component.html',
    styleUrl: './clipboard-field.component.scss',
    standalone: true,
    imports: [
        TranslatePipe,
        AlgoIconComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClipboardFieldComponent {
    @Input() label!: string;
    @Input() text!: string;

    private _simpleNotifBroadcaster: SimpleNotifBroadcaster;

    constructor(private _translateService: TranslateService) {
        this._simpleNotifBroadcaster = new SimpleNotifBroadcaster(new BasicFormatterWithTranslate(this._translateService));
    }

    clipboard() {
        if (!this.text) {
            return;
        }
        navigator.clipboard.writeText(this.text).then(() => {
            this._simpleNotifBroadcaster.send([{
                message: 'AngularSdk.CoreCommon.TextCopied',
                warnLevel: WarnLevel.simpleWarnLevel,
            }]);
        });
    }
}
