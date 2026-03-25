import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonMainActionComponent} from '../button-main-action/button-main-action.component';
import {ScreenSizeHandlerComponent} from '../../../../plugs/screen-size-handler/screen-size-handler.component';

export type ButtonNavigationType = 'prev' | 'next';

@Component({
    selector: 'app-button-slider',
    templateUrl: './button-slider.component.html',
    styleUrl: './button-slider.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonMainActionComponent,
        ScreenSizeHandlerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonSliderComponent {
    @Input() type: ButtonNavigationType = 'prev';
    @Input() text?: string;
    @Input() show_text: boolean = true;
    @Input() disabled_btn!: boolean;
}
