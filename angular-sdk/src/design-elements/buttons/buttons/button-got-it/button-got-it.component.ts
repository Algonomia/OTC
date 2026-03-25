import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-got-it',
    templateUrl: './button-got-it.component.html',
    styleUrl: './button-got-it.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGotItComponent {
    @Input() icon = true;
    @Input() left_icon = false;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Normal';

    rounded = true;
}
