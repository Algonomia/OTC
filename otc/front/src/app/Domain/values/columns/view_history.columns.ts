import {AEnhancedEnumFactory, DateUtils, NumberUtils} from '@algonomia/ts-shared';
import {
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    DisplayRateAsStarsComponent
} from '@algonomia/angular-sdk';
import {Type} from '@angular/core';
import {IDatumHistoryView} from '@otc/domain';
import {buildSortValue} from '../../_column-helpers';

export class HistoryViewColumns extends AEnhancedEnumFactory implements AlgoTableColumns<IDatumHistoryView> {
    static judgeLlmScore = new HistoryViewColumns(
        'judge_llm_score',
        'OTCFront.HistoryView.columns.judge_llm_score.text',
        'date',
        {valueGetter: x => x.judge_llm_score}
    );
    static version = new HistoryViewColumns(
        'version',
        'OTCFront.HistoryView.columns.version.text',
        'date',
        {valueGetter: x => DateUtils.stdStringToDate(x.version)?.toLocaleDateString()}
    );
    static proposedBy = new HistoryViewColumns(
        'proposed_by',
        'OTCFront.HistoryView.columns.proposed_by.text',
        'date',
        {valueGetter: x => x.proposed_by}
    );
    static averageRate = new HistoryViewColumns(
        'average_rate',
        'OTCFront.HistoryView.columns.average_rate.text',
        'numeric',
        {valueGetter: x => !!x.average_rate ? NumberUtils.toFixedNumber(x.average_rate, 2) : x.average_rate}
    );
    static currentUserRate = new HistoryViewColumns(
        'current_user_rate',
        'OTCFront.HistoryView.columns.current_rate.text',
        'numeric',
        {
            valueGetter: x => x.current_user_rate,
            renderComponent: DisplayRateAsStarsComponent,
            renderInputs: x => ({clickable: false, value: x.current_user_rate, size: 'small'})
        }
    );
    static currentUserComment = new HistoryViewColumns(
        'current_user_comment',
        'OTCFront.HistoryView.columns.current_user_comment.text',
        'text',
        {valueGetter: x => x.current_user_comment}
    );

    static getAllColumns() {
        return this.getAllAvailables() as HistoryViewColumns[];
    }

    readonly title: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: IDatumHistoryView) => any;
    readonly sortValue: (x: IDatumHistoryView) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: IDatumHistoryView) => Record<string, unknown>;

    private constructor(
        id: keyof IDatumHistoryView,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            valueGetter?: (x: IDatumHistoryView) => any;
            sortValue?: (x: IDatumHistoryView) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: IDatumHistoryView) => Record<string, unknown>;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? ((x: IDatumHistoryView) => x[id]);
        this.sortValue = opts.sortValue ?? buildSortValue(this.valueGetter, filterType, x => x[id]);
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
    }
}
