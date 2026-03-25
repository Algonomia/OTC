import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-main-action-outline',
    templateUrl: './button-main-action-outline.component.html',
    styleUrl: './button-main-action-outline.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonMainActionOutlineComponent {
    @Input() text!: string;
    @Input() icon!: string;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Normal';
    rounded = false;
}
