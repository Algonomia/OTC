import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonComponent, ButtonSizeType} from '../../button.component';

@Component({
    selector: 'app-button-edit',
    templateUrl: './button-edit.component.html',
    styleUrls: ['button-edit.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonEditComponent {
    @Input() text?: string;
    @Input() left_icon: boolean = false;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Normal';

    rounded = true;
}
