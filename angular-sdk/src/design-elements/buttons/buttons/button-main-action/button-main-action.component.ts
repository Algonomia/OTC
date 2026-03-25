import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-main-action',
    templateUrl: './button-main-action.component.html',
    styleUrl: './button-main-action.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonMainActionComponent {
    @Input() text?: string;
    @Input() icon?: string;
    @Input() left_icon?: boolean = false;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Regular';

    rounded = true;
}
