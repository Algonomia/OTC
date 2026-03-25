import {TranslateService} from '@ngx-translate/core';
import {AppInjector} from '../../../injector';
import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    CountriesService,
    CountryFlagComponent
} from '@algonomia/angular-sdk';
import {Type} from '@angular/core';
import {TValueLine, ObligationType} from '@otc/domain';
import {IOTCBaseSegment} from '@otc/domain';
import {buildSortValue} from '../../_column-helpers';

export class SegmentationColumns extends AEnhancedEnumFactory implements AlgoTableColumns<TValueLine> {
    readonly alignFrozen = 'left';
    readonly frozen = true;

    static jurisdiction = new SegmentationColumns(
        'jurisdiction',
        'OTCFront.ObligationDueDate.columns.Jurisdiction.text',
        'list',
        {
            valueGetter: x => CountriesService.getName(x.jurisdiction, AppInjector.get(TranslateService).currentLang),
            renderComponent: CountryFlagComponent,
            renderInputs: (x: TValueLine) => ({display: 'name', iso2: x.jurisdiction, hideNameMobile: true}),
            hideHeaderOnMobile: true
        }
    );
    static obligationType = new SegmentationColumns(
        'obligation_type_id',
        'OTCFront.ObligationDueDate.columns.ObligationType.text',
        'list',
        {
            valueGetter: x => ObligationType.getText(x.obligation_type_id) ?? x
        }
    );

    static getAllColumns() {
        return this.getAllAvailables() as SegmentationColumns[];
    }

    readonly title: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: TValueLine) => any;
    readonly sortValue: (x: TValueLine) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: TValueLine) => Record<string, unknown>;
    readonly hideHeaderOnMobile?: boolean;

    private constructor(
        id: keyof IOTCBaseSegment,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            valueGetter?: (x: TValueLine) => any;
            sortValue?: (x: TValueLine) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: TValueLine) => Record<string, unknown>;
            hideHeaderOnMobile?: boolean;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? ((x: TValueLine) => x[id]);
        this.sortValue = opts.sortValue ?? buildSortValue(this.valueGetter, filterType, x => x[id]);
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
        this.hideHeaderOnMobile = opts.hideHeaderOnMobile;
    }
}
