import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-continue',
    templateUrl: './button-continue.component.html',
    styleUrl: './button-continue.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonContinueComponent {
    @Input() text?: string;
    @Input() icon: boolean = true;
    @Input() left_icon!: boolean;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Normal';
    rounded = true;
}
