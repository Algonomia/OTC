import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ButtonComponent, ButtonSizeType} from '../../button.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-button-export',
    templateUrl: './button-export.component.html',
    styleUrl: './button-export.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonExportComponent {
    @Input() text: boolean = true;
    @Input() disabled_btn!: boolean;
    @Input() size_theme: ButtonSizeType = 'Normal';
    rounded = false;
}
