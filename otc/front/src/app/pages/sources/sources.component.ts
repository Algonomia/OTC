import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
    AlgoTableColumns,
    AlgoTableComponent,
    ATemplateComponent,
    SpaceLeftComponent
} from '@algonomia/angular-sdk';
import {TSourceViewExt} from '@otc/domain';
import {SourceFetcherService} from '../../Domain/sources/fetchers/source-fetcher.service';
import {ContributionBarComponent} from '../common/contribution-bar/contribution-bar.component';
import {SourceProvenanceColumns} from '../../Domain/sources/columns/source-provenance-columns';
import {SourceAnalysisParamsColumns} from '../../Domain/sources/columns/source-analysis-params-columns';
import {SourceMediumColumns} from '../../Domain/sources/columns/source-medium-columns';
import {SourceUserInteractionColumns} from '../../Domain/sources/columns/source-user-interaction-columns';

@Component({
    selector: 'app-sources',
    imports: [
        AlgoTableComponent,
        ContributionBarComponent,
        SpaceLeftComponent
    ],
    templateUrl: './sources.component.html',
    styleUrl: './sources.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SourcesComponent extends ATemplateComponent implements OnInit {
    columns: AlgoTableColumns<TSourceViewExt>[] = [
        ...SourceProvenanceColumns.getAllColumns(),
        SourceUserInteractionColumns.status,
        ...SourceAnalysisParamsColumns.getAllColumns(),
        ...SourceMediumColumns.getAllColumns(),
        ...SourceUserInteractionColumns.getAllNonStatusColumns()
    ];
    data: TSourceViewExt[] = [];

    constructor(private _sourceFetcherService: SourceFetcherService, private _cd: ChangeDetectorRef) {
        super();
    }

    async ngOnInit() {
        this.pipeTakeUntil(this._sourceFetcherService.fetchAll$()).subscribe(sources => {
            this.data = sources;
            this._cd.markForCheck();
        });
    }
}
