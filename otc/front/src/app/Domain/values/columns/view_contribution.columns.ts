import {AppInjector} from '../../../injector';
import {AEnhancedEnumFactory, DateUtils} from '@algonomia/ts-shared';
import {
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    AlgoTableCommentComponent,
    AlgoTableProposedByComponent
} from '@algonomia/angular-sdk';
import {Type} from '@angular/core';
import {
    IDatumContributionView, Indicator, ObligationType, EObligationTypeId, EValuesStatus, ValuesStatusExt
} from '@otc/domain';
import {ValuesFetcherService} from '../fetchers/values-fetcher.service';
import {ValidateOrRejectValueComponent} from './validate-or-reject-value/validate-or-reject-value.component';
import {IndicatorColumns} from './indicators.columns';
import {
    LabelStatusContributionComponent
} from '../../../sdk/labels/label-status-contribution/label-status-contribution.component';
import {buildSortValue} from '../../_column-helpers';

export const actionOnValuesColumn: AlgoTableColumns<{id: number, status: EValuesStatus}> = {
    id: 'actions',
    title: 'OTCFront.ContributionView.columns.actions.text',
    filterType: 'none',
    valueGetter: (_ => ''),
    renderComponent: ValidateOrRejectValueComponent,
    renderInputs: (x => ({id: x.id, status: x.status})),
    alignFrozen: 'right',
    frozen: true,
    show: () => AppInjector.get(ValuesFetcherService).canManageValues()
};

export class ContributionViewColumns extends AEnhancedEnumFactory implements AlgoTableColumns<IDatumContributionView> {
    static key = new ContributionViewColumns(
        'key',
        'OTCFront.ContributionView.columns.key.text',
        'text',
        {valueGetter: x => Indicator.getText(x.key)}
    );
    static value = new ContributionViewColumns(
        'value',
        'OTCFront.ContributionView.columns.value.text',
        'none',
        {
            valueGetter: x => IndicatorColumns.getColumnById(x.key)?.baseValueGetter(x?.value),
            sortValue: x => IndicatorColumns.getColumnById(x.key)?.baseSortValue(x?.value),
            renderComponent: x => IndicatorColumns.getColumnById(x.key)?.renderComponent,
            renderInputs: x => {
                const renderInputs = IndicatorColumns.getColumnById(x.key)?.baseRenderInputs;
                return renderInputs ? renderInputs(x?.value) : {};
            }
        }
    );
    static subObligations = ObligationType.getAllSubObligations().map(subObligation => {
        return new ContributionViewColumns(
            subObligation.id,
            subObligation.text,
            'none',
            {
                valueGetter: x => IndicatorColumns.getColumnById(x.key)?.baseValueGetter(x?.additional_values?.[subObligation.id]),
                sortValue: x => IndicatorColumns.getColumnById(x.key)?.baseSortValue(x?.additional_values?.[subObligation.id]),
                renderComponent: x => IndicatorColumns.getColumnById(x.key)?.renderComponent,
                renderInputs: x => {
                    const renderInputs = IndicatorColumns.getColumnById(x.key)?.baseRenderInputs;
                    return renderInputs ? renderInputs(x?.additional_values?.[subObligation.id]) : {};
                },
                show: (data: IDatumContributionView[]) => data?.some(x => {
                    const value = x?.additional_values?.[subObligation.id];
                    return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
                }) ?? false
            }
        );
    });
    static notes = new ContributionViewColumns(
        'notes',
        'OTCFront.ContributionView.columns.notes.text',
        'text',
        {valueGetter: x => IndicatorColumns.getColumnById(x.key)?.baseNotesValueGetter(x)}
    );
    static reference = new ContributionViewColumns(
        'reference',
        'OTCFront.ContributionView.columns.reference.text',
        'text',
        {valueGetter: x => (IndicatorColumns.getById(x.key) as IndicatorColumns)?.baseRefValueGetter(x)}
    );
    static proposedBy = new ContributionViewColumns(
        'proposed_by',
        'OTCFront.ContributionView.columns.proposed_by.text',
        'date',
        {
            valueGetter: x => x.proposed_by,
            renderComponent: AlgoTableProposedByComponent,
            renderInputs: x => ({text: x.proposed_by}),
        }
    );
    static version = new ContributionViewColumns(
        'version',
        'OTCFront.ContributionView.columns.version.text',
        'date',
        {valueGetter: x => DateUtils.stdStringToDate(x.version)?.toLocaleDateString()}
    );
    static status = new ContributionViewColumns(
        'status',
        'OTCFront.ContributionView.columns.status.text',
        'text',
        {
            valueGetter: x => ValuesStatusExt.getTextFromId(x.status),
            renderComponent: LabelStatusContributionComponent,
            renderInputs: x => ({valueStatusId: x.status})
        }
    );
    static adminComment = new ContributionViewColumns(
        'admin_comment',
        'OTCFront.ContributionView.columns.admin_comment.text',
        'text',
        {
            valueGetter: x => x.admin_comment,
            renderComponent: AlgoTableCommentComponent,
            renderInputs: x => ({text: x.admin_comment}),
        }
    );

    static getAllColumns() {
        return [
            ...this.getAllAvailables() as ContributionViewColumns[],
            actionOnValuesColumn
        ];
    }

    readonly title: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: IDatumContributionView) => any;
    readonly sortValue: (x: IDatumContributionView) => any;
    readonly renderComponent?: Type<unknown> | ((x: IDatumContributionView) => Type<unknown> | undefined);
    readonly renderInputs?: (data: IDatumContributionView) => Record<string, unknown>;
    readonly show?: (data: IDatumContributionView[]) => boolean;

    private constructor(
        id: EObligationTypeId | keyof IDatumContributionView,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            valueGetter?: (x: IDatumContributionView) => any;
            sortValue?: (x: IDatumContributionView) => any;
            renderComponent?: Type<unknown> | ((x: IDatumContributionView) => Type<unknown> | undefined);
            renderInputs?: (data: IDatumContributionView) => Record<string, unknown>;
            show?: (data: IDatumContributionView[]) => boolean;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? ((x: IDatumContributionView) => x[this.id as keyof IDatumContributionView]);
        this.sortValue = opts.sortValue ?? buildSortValue(this.valueGetter, filterType, (x: any) => x[id]);
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
        this.show = opts.show;
    }
}
