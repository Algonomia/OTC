import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-main-outline',
    templateUrl: './button-main-outline.component.html',
    styleUrl: './button-main-outline.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonMainOutlineComponent {
    @Input() text!: string;
    @Input() icon!: string;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'ExtraLarge';
    rounded = true;
}
