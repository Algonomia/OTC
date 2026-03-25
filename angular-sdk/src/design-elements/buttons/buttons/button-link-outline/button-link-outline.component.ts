import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';
import {HrefHandlerComponent, QueryParamsType} from '../../../../plugs/href-handler/href-handler.component';

@Component({
    selector: 'app-button-link-outline',
    templateUrl: './button-link-outline.component.html',
    styleUrl: './button-link-outline.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
        HrefHandlerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonLinkOutlineComponent {
    @Input() link!: string;
    @Input() queryParams?: QueryParamsType;
    @Input() text!: string;
    @Input() disabled_btn!: boolean;
    @Input() icon: boolean = true;
    @Input() size_theme: ButtonSizeType = 'Normal';
    rounded = true;
}
