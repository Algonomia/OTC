import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {AlgoTableColumnFilterType, AlgoTableColumns} from '@algonomia/angular-sdk';
import {IOTCDatumId} from '@otc/domain';
import {Type} from '@angular/core';
import {ButtonRateModalComponent} from './button-rate-modal/button-rate-modal.component';

export class RateOtcValueColumns extends AEnhancedEnumFactory implements AlgoTableColumns<IOTCDatumId> {
    static rateValue = new RateOtcValueColumns(
        'rateValue',
        'OTCFront.Rates.columns.Action.text',
        'none',
        {
            info: 'OTCFront.Rates.columns.Action.info',
            valueGetter: _ => '',
            renderComponent: ButtonRateModalComponent,
            renderInputs: x => ({datumId: {type: x.type, id: x.id}}),
            alignFrozen: 'right',
            frozen: true,
        }
    );

    static getAllColumns() {
        return this.getAllAvailables();
    }

    readonly title: string;
    readonly info: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: IOTCDatumId) => any;
    readonly sortValue?: (x: IOTCDatumId) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: IOTCDatumId) => Record<string, unknown>;
    readonly alignFrozen?: 'center' | 'left' | 'right';
    readonly frozen?: boolean;

    private constructor(
        id: string,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            info?: string;
            valueGetter?: (x: IOTCDatumId) => any;
            sortValue?: (x: IOTCDatumId) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: IOTCDatumId) => Record<string, unknown>;
            alignFrozen?: 'center' | 'left' | 'right';
            frozen?: boolean;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.info = opts.info ?? '';
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? (_ => '');
        this.sortValue = opts.sortValue;
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
        this.alignFrozen = opts.alignFrozen;
        this.frozen = opts.frozen;
    }
}
