import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
    AlgoTableColumns,
    AlgoTableComponent,
    ATemplateComponent,
    SpaceLeftComponent
} from '@algonomia/angular-sdk';
import {TDatumFullContributionViewExt} from '@otc/domain';
import {ValuesFetcherService} from '../../Domain/values/fetchers/values-fetcher.service';
import {ContributionViewColumns} from '../../Domain/values/columns/view_contribution.columns';
import {ContributionBarComponent} from '../common/contribution-bar/contribution-bar.component';
import {SourceProvenanceColumns} from '../../Domain/sources/columns/source-provenance-columns';
import {SourceMediumColumns} from '../../Domain/sources/columns/source-medium-columns';
import {SegmentationColumns} from '../../Domain/values/columns/segmentation.columns';

@Component({
    selector: 'app-contribution-view',
    imports: [
        AlgoTableComponent,
        ContributionBarComponent,
        SpaceLeftComponent
    ],
    templateUrl: './contribution-view.component.html',
    styleUrl: './contribution-view.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContributionViewComponent extends ATemplateComponent implements OnInit {
    columns: AlgoTableColumns<TDatumFullContributionViewExt>[] = [
        ...SegmentationColumns.getAllColumns(),
        ...ContributionViewColumns.getAllColumns(),
        ...SourceProvenanceColumns.getAllColumns(),
        ...SourceMediumColumns.getAllColumns(),
    ] as AlgoTableColumns<TDatumFullContributionViewExt>[];
    data: TDatumFullContributionViewExt[] = [];

    constructor(private _valuesFetcherService: ValuesFetcherService, private _cd: ChangeDetectorRef) {
        super();
    }

    async ngOnInit() {
        this.pipeTakeUntil(this._valuesFetcherService.fetchContributions$()).subscribe(values => {
            this.data = values;
            this._cd.markForCheck();
        });
    }
}
