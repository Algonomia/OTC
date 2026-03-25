import {AEnhancedEnumFactory, DateUtils} from '@algonomia/ts-shared';
import {AlgoTableColumnFilterType, AlgoTableColumns} from '@algonomia/angular-sdk';
import {Type} from '@angular/core';
import {IOTCRate} from '@otc/domain';
import {buildSortValue} from '../../_column-helpers';

export class RateColumns extends AEnhancedEnumFactory implements AlgoTableColumns<IOTCRate> {
    static rate = new RateColumns(
        'rate',
        'OTCFront.Rates.columns.rate.text',
        'text',
        {valueGetter: x => x.rate}
    );
    static ratedBy = new RateColumns(
        'rated_by',
        'OTCFront.Rates.columns.rated_by.text',
        'text',
        {valueGetter: x => x.rated_by}
    );
    static ratedAt = new RateColumns(
        'rated_at',
        'OTCFront.Rates.columns.rated_at.text',
        'date',
        {valueGetter: x => DateUtils.stdStringToDate(x.rated_at)?.toLocaleDateString()}
    );
    static comment = new RateColumns(
        'comment',
        'OTCFront.Rates.columns.comment.text',
        'text',
        {valueGetter: x => x.comment}
    );

    static getAllColumns() {
        return this.getAllAvailables();
    }

    static getNonHeaderColumns() {
        return [this.comment];
    }

    readonly title: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: IOTCRate) => any;
    readonly sortValue: (x: IOTCRate) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: IOTCRate) => Record<string, unknown>;

    private constructor(
        id: keyof IOTCRate,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            valueGetter?: (x: IOTCRate) => any;
            sortValue?: (x: IOTCRate) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: IOTCRate) => Record<string, unknown>;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? ((x: IOTCRate) => x[id]);
        this.sortValue = opts.sortValue ?? buildSortValue(this.valueGetter, filterType, x => x[id]);
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
    }
}
