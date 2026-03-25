import {ChangeDetectionStrategy, Component, Input, TemplateRef} from '@angular/core';
import {AlgoIconComponent} from '../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe} from '@ngx-translate/core';
import {NgTemplateOutlet} from '@angular/common';
import {ScreenSizeHandlerComponent} from '../../plugs/screen-size-handler/screen-size-handler.component';

@Component({
    selector: 'app-bar',
    imports: [
        AlgoIconComponent,
        TranslatePipe,
        NgTemplateOutlet,
        ScreenSizeHandlerComponent
    ],
    templateUrl: './bar.component.html',
    styleUrl: './bar.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarComponent {
    @Input() contentTpl!: TemplateRef<any>;
    @Input() rounded = false;
    @Input() highlighted = false;
    @Input() title: string = '';
    @Input() icon = '';
}
