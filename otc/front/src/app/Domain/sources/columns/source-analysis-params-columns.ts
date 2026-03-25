import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {
    AlgoTableArrayTextComponent,
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    AlgoTableCommentComponent,
    MultiCountryFlagComponent
} from '@algonomia/angular-sdk';
import {ISourceAnalysisParamsExt} from '@otc/domain';
import {Type} from '@angular/core';
import {AppInjector} from '../../../injector';
import {TranslateService} from '@ngx-translate/core';
import {buildSortValue, buildDefaultValueGetter} from '../../_column-helpers';

export enum ESourceAnalysisParamsColumnId {
    Jurisdictions = 'Jurisdictions',
    ObligationsTypes = 'ObligationsTypes',
    Indicators = 'Indicators',
    Comment = 'Comment'
}

export class SourceAnalysisParamsColumns extends AEnhancedEnumFactory implements AlgoTableColumns<ISourceAnalysisParamsExt> {
    static jurisdictions = new SourceAnalysisParamsColumns(
        ESourceAnalysisParamsColumnId.Jurisdictions,
        'OTCFront.Sources.columns.Jurisdictions.text',
        'list',
        {
            info: 'OTCFront.Sources.columns.Jurisdictions.info',
            valueGetter: x => x.jurisdictions.join(' / '),
            renderComponent: MultiCountryFlagComponent,
            renderInputs: (x: ISourceAnalysisParamsExt) => ({countries: x.jurisdictions})
        }
    );
    static obligationTypes = new SourceAnalysisParamsColumns(
        ESourceAnalysisParamsColumnId.ObligationsTypes,
        'OTCFront.Sources.columns.ObligationsTypes.text',
        'list',
        {
            info: 'OTCFront.Sources.columns.ObligationsTypes.info',
            valueGetter: x => x.obligation_types.map(t => AppInjector.get(TranslateService).instant(t.text)),
            renderComponent: AlgoTableArrayTextComponent,
            renderInputs: x => ({texts: x.obligation_types.map(t => AppInjector.get(TranslateService).instant(t.text))}),
        }
    );
    static indicators = new SourceAnalysisParamsColumns(
        ESourceAnalysisParamsColumnId.Indicators,
        'OTCFront.Sources.columns.Indicators.text',
        'list',
        {
            info: 'OTCFront.Sources.columns.Indicators.info',
            valueGetter: x => x.indicators.map(i => AppInjector.get(TranslateService).instant(i.text))
        }
    );
    static comment = new SourceAnalysisParamsColumns(
        ESourceAnalysisParamsColumnId.Comment,
        'OTCFront.Sources.columns.Comment.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.Comment.info',
            valueGetter: x => x.comment,
            renderComponent: AlgoTableCommentComponent,
            renderInputs: x => ({text: x.comment}),
        }
    );

    static getTitle(id: ESourceAnalysisParamsColumnId): string {
        return (this.getByIdOrId(id) as SourceAnalysisParamsColumns | undefined)?.title ?? id;
    }

    static getInfo(id: ESourceAnalysisParamsColumnId): string {
        return (this.getByIdOrId(id) as SourceAnalysisParamsColumns | undefined)?.info ?? id;
    }

    static getAllColumns() {
        return this.getAllAvailables() as SourceAnalysisParamsColumns[];
    }

    readonly title: string;
    readonly info: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: ISourceAnalysisParamsExt) => any;
    readonly sortValue: (x: ISourceAnalysisParamsExt) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: ISourceAnalysisParamsExt) => Record<string, unknown>;
    readonly pin?: 'left' | 'right';
    readonly show?: () => boolean | Promise<boolean>;

    private constructor(
        id: ESourceAnalysisParamsColumnId,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            info?: string;
            valueGetter?: (x: ISourceAnalysisParamsExt) => any;
            sortValue?: (x: ISourceAnalysisParamsExt) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: ISourceAnalysisParamsExt) => Record<string, unknown>;
            pin?: 'left' | 'right';
            show?: () => boolean | Promise<boolean>;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.info = opts.info ?? '';
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? buildDefaultValueGetter(id, filterType);
        this.sortValue = opts.sortValue ?? buildSortValue(this.valueGetter, filterType);
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
        this.pin = opts.pin;
        this.show = opts.show;
    }
}
