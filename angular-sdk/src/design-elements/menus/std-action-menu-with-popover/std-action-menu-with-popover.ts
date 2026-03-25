import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {EdgePopoverComponent} from '../../../plugs/edge-popover/edge-popover.component';
import {IAction, StdActionsMenuComponent} from '../std-actions-menu/std-actions-menu.component';

type MenuTheme = 'header-menu' | 'dashboard-menu';

@Component({
  selector: 'app-std-action-menu-with-popover',
    imports: [
        EdgePopoverComponent,
        StdActionsMenuComponent
    ],
  templateUrl: './std-action-menu-with-popover.html',
  styleUrl: './std-action-menu-with-popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class StdActionMenuWithPopover<T extends unknown[]> implements OnInit {
    @ViewChild(EdgePopoverComponent) popoverComponent!: EdgePopoverComponent;
    @Input() triggerTpl!: TemplateRef<any>;
    @Input() actions?: IAction<T>[] = [];
    @Input() action_inputs!: T;
    @Input() menu_theme: MenuTheme = 'header-menu';

    constructor() {}

    __popover_class: string = 'dark-menu';

    ngOnInit() {
        switch (this.menu_theme) {
            case 'header-menu':
                this.__popover_class = 'light-menu';
                break;
            case 'dashboard-menu':
                this.__popover_class = 'dark-menu';
                break;
            default:
                this.__popover_class = 'dark-menu';
                break;
        }
    }
}
