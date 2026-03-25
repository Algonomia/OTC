import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IOTCDatumId} from '@otc/domain';
import {ButtonMainActionComponent} from '@algonomia/angular-sdk';
import {RateModalComponent} from '../../rate-modal/rate-modal.component';

@Component({
  selector: 'app-button-rate-modal',
    imports: [
        ButtonMainActionComponent
    ],
  templateUrl: './button-rate-modal.component.html',
  styleUrl: './button-rate-modal.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonRateModalComponent {
    @Input() datumId!: IOTCDatumId;

    openRateModal() {
        RateModalComponent.open(this.datumId);
    }
}
