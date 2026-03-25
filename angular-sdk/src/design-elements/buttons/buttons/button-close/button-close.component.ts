import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonComponent, ButtonSizeType} from '../../button.component';

@Component({
    selector: 'app-button-close',
    templateUrl: './button-close.component.html',
    styleUrls: ['button-close.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonCloseComponent {
    @Input() size_theme: ButtonSizeType = 'Normal';
    rounded = false;
}
