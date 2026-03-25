import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';
import {HrefHandlerComponent} from '../../../../plugs/href-handler/href-handler.component';

@Component({
    selector: 'app-button-link-outline-big',
    templateUrl: './button-link-outline-big.component.html',
    styleUrl: './button-link-outline-big.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
        HrefHandlerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonLinkOutlineBigComponent {
    @Input() link!: string;
    @Input() text!: string;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'ExtraLarge';
    rounded = true;
}
