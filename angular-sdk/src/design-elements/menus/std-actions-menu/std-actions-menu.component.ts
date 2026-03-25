import {
    ChangeDetectionStrategy,
    Component, EventEmitter,
    Input, Output,
    Pipe, PipeTransform
} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

export interface IAction<T extends unknown[]> {
    title: string,
    callback: (...args: T) => void,
    condition?: (...args: T) => boolean
}

@Pipe({
    name: 'checkActionCondition',
    standalone: true
})
export class CheckActionConditionPipe implements PipeTransform {
    transform<T extends unknown[]>(action: IAction<T>, actionInputs: T): boolean {
        if (!action) {
            return false;
        }
        const inputs = actionInputs ?? [];
        return !!action.condition ? action.condition(...inputs) : true;
    }
}

@Component({
    selector: 'app-std-actions-menu',
    imports: [
        TranslatePipe,
        CheckActionConditionPipe
    ],
    templateUrl: './std-actions-menu.component.html',
    styleUrl: './std-actions-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class StdActionsMenuComponent<T extends unknown[]> {
    @Input() actions?: IAction<T>[] = [];
    @Input() action_inputs!: T;
    @Output() onActionTrigger = new EventEmitter<void>();

    constructor() {}

    protected __callAction(action: IAction<T>) {
        const inputs = this.action_inputs ?? [];
        action.callback(...inputs);
        this.onActionTrigger.emit();
    }
}
