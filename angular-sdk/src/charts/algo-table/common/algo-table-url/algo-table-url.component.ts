import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-algo-table-url',
  imports: [],
  templateUrl: './algo-table-url.component.html',
  styleUrl: './algo-table-url.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoTableUrlComponent {
    @Input() url: string = '';
}
