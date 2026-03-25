import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonComponent, ButtonSizeType} from '../../button.component';

@Component({
    selector: 'app-button-cancel',
    templateUrl: './button-cancel.component.html',
    styleUrls: ['button-cancel.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonCancelComponent {
    @Input() size_theme: ButtonSizeType = 'Normal';
    rounded = false;
}
