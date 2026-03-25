import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-remove',
    templateUrl: './button-remove.component.html',
    styleUrl: './button-remove.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonRemoveComponent {
    @Input() icon = true;
    @Input() left_icon = false;
    @Input() disabled_btn!: boolean;
    @Input() text: boolean = true;
    @Input() size_theme: ButtonSizeType = 'Normal';

    rounded = false;
}
