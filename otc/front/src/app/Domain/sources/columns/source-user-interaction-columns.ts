import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    AlgoTableDateComponent,
    AlgoTableEmailComponent
} from '@algonomia/angular-sdk';
import {ISourceUserInteractionExt} from '@otc/domain';
import {Type} from '@angular/core';
import {AppInjector} from '../../../injector';
import {ValidateOrRejectSourceComponent} from './validate-or-reject-source/validate-or-reject-source.component';
import {SourceFetcherService} from '../fetchers/source-fetcher.service';
import {
    LabelStatusSourceComponent
} from '../../../sdk/labels/label-status-source/label-status-source.component';
import {buildSortValue, buildDefaultValueGetter} from '../../_column-helpers';

export enum ESourceUserInteractionColumnId {
    ProposedBy = 'ProposedBy',
    PropositionDate = 'PropositionDate',
    ValidatedBy = 'ValidatedBy',
    ValidationDate = 'ValidationDate',
    Status = 'Status',
    AdminComment = 'AdminComment',
    Action = 'Action'
}

export class SourceUserInteractionColumns extends AEnhancedEnumFactory implements AlgoTableColumns<ISourceUserInteractionExt> {
    static status = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.Status,
        'OTCFront.Sources.columns.Status.text',
        'list',
        {
            info: 'OTCFront.Sources.columns.Status.info',
            valueGetter: x => x.status.text,
            renderComponent: LabelStatusSourceComponent,
            renderInputs: x => ({valueStatusId: x.status}),
        }
    );
    static proposedBy = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.ProposedBy,
        'OTCFront.Sources.columns.ProposedBy.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.ProposedBy.info',
            valueGetter: x => x.proposed_by,
            renderComponent: AlgoTableEmailComponent,
            renderInputs: x => ({text: x.proposed_by}),
        }
    );
    static propositionDate = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.PropositionDate,
        'OTCFront.Sources.columns.PropositionDate.text',
        'date',
        {
            info: 'OTCFront.Sources.columns.PropositionDate.info',
            valueGetter: x => x.proposed_at,
            renderComponent: AlgoTableDateComponent,
            renderInputs: x => ({date: x.proposed_at}),
        }
    );
    static validatedBy = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.ValidatedBy,
        'OTCFront.Sources.columns.ValidatedBy.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.ValidatedBy.info',
            valueGetter: x => x.validated_by
        }
    );
    static validationDate = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.ValidationDate,
        'OTCFront.Sources.columns.ValidationDate.text',
        'date',
        {
            info: 'OTCFront.Sources.columns.ValidationDate.info',
            valueGetter: x => x.validated_at,
            renderComponent: AlgoTableDateComponent,
            renderInputs: x => ({date: x.validated_at}),
        }
    );
    static adminComment = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.AdminComment,
        'OTCFront.Sources.columns.AdminComment.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.AdminComment.info',
            valueGetter: x => x.admin_comment
        }
    );
    static action = new SourceUserInteractionColumns(
        ESourceUserInteractionColumnId.Action,
        'OTCFront.Sources.columns.Action.text',
        'none',
        {
            info: 'OTCFront.Sources.columns.Action.info',
            valueGetter: _ => '',
            renderComponent: ValidateOrRejectSourceComponent,
            renderInputs: x => ({id: x.source_id, status: x.status.id}),
            alignFrozen: 'right',
            show: () => AppInjector.get(SourceFetcherService).canManageSources(),
            frozen: true
        }
    );

    static getTitle(id: ESourceUserInteractionColumnId): string {
        return (this.getByIdOrId(id) as SourceUserInteractionColumns | undefined)?.title ?? id;
    }

    static getInfo(id: ESourceUserInteractionColumnId): string {
        return (this.getByIdOrId(id) as SourceUserInteractionColumns | undefined)?.info ?? id;
    }

    static getAllNonStatusColumns() {
        return (this.getAllAvailables() as SourceUserInteractionColumns[]).filter(x => x.id !== ESourceUserInteractionColumnId.Status);
    }

    readonly title: string;
    readonly info: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: ISourceUserInteractionExt) => any;
    readonly sortValue: (x: ISourceUserInteractionExt) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: ISourceUserInteractionExt) => Record<string, unknown>;
    readonly alignFrozen?: 'center' | 'left' | 'right';
    readonly show?: () => boolean | Promise<boolean>;
    readonly frozen?: boolean;

    private constructor(
        id: ESourceUserInteractionColumnId,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            info?: string;
            valueGetter?: (x: ISourceUserInteractionExt) => any;
            sortValue?: (x: ISourceUserInteractionExt) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: ISourceUserInteractionExt) => Record<string, unknown>;
            alignFrozen?: 'center' | 'left' | 'right';
            show?: () => boolean | Promise<boolean>;
            frozen?: boolean;
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
        this.alignFrozen = opts.alignFrozen;
        this.show = opts.show;
        this.frozen = opts.frozen;
    }
}
