import {
    ChangeDetectionStrategy,
    Component, EventEmitter, Input, OnInit, Output,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {AlgoIconComponent} from '../../../algo-icon/algo-icon/algo-icon.component';

@Component({
    selector: 'app-done-step',
    templateUrl: './done-step.component.html',
    styleUrl: './done-step.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        AlgoIconComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoneStepComponent implements OnInit {
    @Output() close = new EventEmitter<void>();
    @Input() messages!: string[];

    ngOnInit() {
        setTimeout(() => {
            this.close.emit();
        }, 4000);
    }
}
