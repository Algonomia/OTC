import {Component, Input} from '@angular/core';
import {JurisdictionExportComponent} from './jurisdiction-export/jurisdiction-export.component';
import {
    AlgoTableColumns,
    CardComponent,
    JurisdictionFlagLabelComponent
} from '@algonomia/angular-sdk';

@Component({
  selector: 'app-jurisdiction-card',
    imports: [
        JurisdictionExportComponent,
        CardComponent,
        JurisdictionFlagLabelComponent
    ],
  templateUrl: './jurisdiction-card.component.html',
  styleUrl: './jurisdiction-card.component.css'
})
export class JurisdictionCardComponent<T> {
    @Input() columns!: AlgoTableColumns<T>[];
    @Input() getIso2Callback?: (x: T) => string;
    @Input() data!: T[];

    getIso2(x: T) {
        return this.getIso2Callback ? this.getIso2Callback(x) : '';
    }
}
