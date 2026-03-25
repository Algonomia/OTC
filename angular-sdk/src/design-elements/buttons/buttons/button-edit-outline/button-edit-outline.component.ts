import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonComponent, ButtonSizeType} from '../../button.component';

@Component({
    selector: 'app-button-edit-outline',
    templateUrl: './button-edit-outline.component.html',
    styleUrls: ['button-edit-outline.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonEditOutlineComponent {
    @Input() text?: string;
    @Input() left_icon: boolean = false;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Normal';

    rounded = true;
}
