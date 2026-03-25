import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {SourceChoice} from '../../source-modal.component';
import {BigButtonComponent} from '@algonomia/angular-sdk';

@Component({
    selector: 'app-choice-source',
    templateUrl: './choice-source.component.html',
    styleUrls: ['../../source-modal.component.scss', './choice-source.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        BigButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceSourceComponent {
    @Output() next = new EventEmitter<SourceChoice>();

    emitSourceType(type: SourceChoice) {
        this.next.emit(type);
    }
}
