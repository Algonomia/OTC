import {ChangeDetectionStrategy, Component, computed, input, Input} from '@angular/core';
import {IconWeight} from '../weight-handler';

@Component({
    selector: 'app-algo-icon',
    templateUrl: './algo-icon.component.html',
    styleUrl: './algo-icon.component.css',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoIconComponent {
    name= input<string>('');
    label = input<string>('');
    weight = input<IconWeight>('Normal');

    path = computed(() => 'assets/sprite.svg#' + this.weight() + ':' + this.name())
}
