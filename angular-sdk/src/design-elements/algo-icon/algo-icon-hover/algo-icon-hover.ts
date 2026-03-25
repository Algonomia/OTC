import {ChangeDetectionStrategy, Component, computed, Input, input} from '@angular/core';
import {AlgoIconWeightHandler, IconWeight} from '../weight-handler';
import {AlgoIconComponent} from '../algo-icon/algo-icon.component';
import {IconHoverDirective} from './algo-icon-hover.directive';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-algo-icon-hover',
    imports: [
        AlgoIconComponent,
        IconHoverDirective,
        NgClass
    ],
  templateUrl: './algo-icon-hover.html',
  styleUrl: './algo-icon-hover.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoIconHover {
    @Input() name!: string;
    @Input() class: string = '';
    @Input() label = '';
    weight = input<IconWeight>('Normal');
    iconHandler = computed(() => new AlgoIconWeightHandler(this.weight()));
}
