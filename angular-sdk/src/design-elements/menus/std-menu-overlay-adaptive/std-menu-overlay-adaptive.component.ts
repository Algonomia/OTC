import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ScreenSizeHandlerComponent} from '../../../plugs/screen-size-handler/screen-size-handler.component';
import {StdMenuComponent} from '../std-menu/std-menu.component';
import {StdMenuOverlayModalComponent} from '../std-menu-overlay-modal/std-menu-overlay-modal.component';
import {SelectHandler} from '../../../handlers/select-handler/select-handler';

@Component({
    selector: 'app-std-menu-overlay-adaptive',
    imports: [
        ScreenSizeHandlerComponent,
        StdMenuComponent,
        StdMenuOverlayModalComponent
    ],
    templateUrl: './std-menu-overlay-adaptive.component.html',
    styleUrl: './std-menu-overlay-adaptive.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StdMenuOverlayAdaptiveComponent<T, ID> {
    @Input() selectHandler!: SelectHandler<T, ID>;
    @Input() placeholder: string = 'Menu';
    @Input() modalTitle: string = '';
    @Input() selectAll: boolean = true;
    @Input() sorted: boolean = true;
}
