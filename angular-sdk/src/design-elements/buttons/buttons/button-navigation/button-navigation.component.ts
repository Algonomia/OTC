import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonMainActionComponent} from '../button-main-action/button-main-action.component';
import {ScreenSizeHandlerComponent} from '../../../../plugs/screen-size-handler/screen-size-handler.component';

export type ButtonNavigationType = 'prev' | 'next';

@Component({
    selector: 'app-button-navigation',
    templateUrl: './button-navigation.component.html',
    styleUrl: './button-navigation.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonMainActionComponent,
        ScreenSizeHandlerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonNavigationComponent {
    @Input() type: ButtonNavigationType = 'prev';
    @Input() text?: string;
    @Input() show_text: boolean = true;
    @Input() disabled_btn!: boolean;
}
