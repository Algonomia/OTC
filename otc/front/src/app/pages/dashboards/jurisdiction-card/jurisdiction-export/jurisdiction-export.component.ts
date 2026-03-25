import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {JurisdictionExportService} from './jurisdiction-export.service';
import {
    AlgoTableColumns,
    ButtonExportComponent,
    DataWrapper,
    SimpleNotifBroadcaster,
    WarnLevel
} from '@algonomia/angular-sdk';

@Component({
    selector: 'app-jurisdiction-export',
    imports: [
        ButtonExportComponent
    ],
    templateUrl: './jurisdiction-export.component.html',
    styleUrl: './jurisdiction-export.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JurisdictionExportComponent<T> {
    @Input() data!: DataWrapper<T>;
    @Input() getIso2Callback?: ((x: T) => string);
    @Input() columns!: AlgoTableColumns<T>[];
    @Input() wrapper!: HTMLDivElement;

    constructor(private jurisdictionExportService: JurisdictionExportService) {}

    async onExportClick(): Promise<void> {
        if (!this.data || !this.data.line || !this.columns) {
            return;
        }
        try {
            await this.jurisdictionExportService.exportJurisdictionData(
                this.columns,
                this.data,
                this.wrapper,
                this.getIso2Callback,
                'download',
            );
        } catch {
            SimpleNotifBroadcaster.sendMessageOnDefaultChannel(
                'OTCFront.JurisdictionPdfExport.ExportError',
                WarnLevel.errorWarnLevel
            );
        }
    }
}
