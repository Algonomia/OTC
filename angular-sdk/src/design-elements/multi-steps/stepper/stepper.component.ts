import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stepper',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stepper.component.html',
    styleUrls: ['./stepper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
    @Input() currentStep = 0;
    @Input() totalSteps = 0;

    get stepsArray(): number[] {
        return Array.from({ length: this.totalSteps }, (_, i) => i);
    }
}
