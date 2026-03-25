import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {
    AlgoTableActiveOrExpiredComponent,
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    AlgoTableTimeDiffComponent
} from '@algonomia/angular-sdk';
import {Type} from '@angular/core';
import {IFrontApiAccessPublicInfo} from '@otc/domain';
import {buildSortValue} from '../../../Domain/_column-helpers';

export enum EApiAccessColumnId {
    Status = 'status',
    AccessKey = 'access_key',
    LastUsedAt = 'last_used_at',
    ExpiresAt = 'expires_at',
    CreatedAt = 'created_at',
}

export class ApiAccessViewColumns extends AEnhancedEnumFactory implements AlgoTableColumns<IFrontApiAccessPublicInfo> {
    static status = new ApiAccessViewColumns(
        EApiAccessColumnId.Status,
        'OTCFront.Api.columns.status.text',
        'boolean',
        {
            valueGetter: x => x.expires_at.getTime() > new Date().getTime(),
            renderComponent: AlgoTableActiveOrExpiredComponent,
            renderInputs: x => ({isActive: x.expires_at.getTime() > new Date().getTime()})
        }
    );
    static accessKey = new ApiAccessViewColumns(
        EApiAccessColumnId.AccessKey,
        'OTCFront.Api.columns.accessKey.text',
        'text',
        {valueGetter: x => x.access_key}
    );
    static lastUsed = new ApiAccessViewColumns(
        EApiAccessColumnId.LastUsedAt,
        'OTCFront.Api.columns.lastUsed.text',
        'date',
        {
            valueGetter: x => x.last_used_at,
            renderComponent: AlgoTableTimeDiffComponent,
            renderInputs: x => ({date: x.last_used_at})
        }
    );
    static expiresAt = new ApiAccessViewColumns(
        EApiAccessColumnId.ExpiresAt,
        'OTCFront.Api.columns.expires_at.text',
        'date',
        {
            valueGetter: x => x.expires_at,
            renderComponent: AlgoTableTimeDiffComponent,
            renderInputs: x => ({date: x.expires_at})
        }
    );
    static age = new ApiAccessViewColumns(
        EApiAccessColumnId.CreatedAt,
        'OTCFront.Api.columns.age.text',
        'date',
        {
            valueGetter: x => x.created_at,
            renderComponent: AlgoTableTimeDiffComponent,
            renderInputs: x => ({date: x.created_at})
        }
    );

    static getAllColumns() {
        return [...this.getAllAvailables() as ApiAccessViewColumns[]];
    }

    readonly title: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: IFrontApiAccessPublicInfo) => any;
    readonly sortValue: (x: IFrontApiAccessPublicInfo) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: IFrontApiAccessPublicInfo) => Record<string, unknown>;

    private constructor(
        id: EApiAccessColumnId,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            valueGetter?: (x: IFrontApiAccessPublicInfo) => any;
            sortValue?: (x: IFrontApiAccessPublicInfo) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: IFrontApiAccessPublicInfo) => Record<string, unknown>;
        } = {}
    ) {
        super(id);
        this.title = title;
        this.filterType = filterType;
        this.valueGetter = opts.valueGetter ?? ((x: IFrontApiAccessPublicInfo) => x[this.id as keyof IFrontApiAccessPublicInfo]);
        this.sortValue = opts.sortValue ?? buildSortValue(this.valueGetter, filterType, x => x);
        this.renderComponent = opts.renderComponent;
        this.renderInputs = opts.renderInputs;
    }
}
