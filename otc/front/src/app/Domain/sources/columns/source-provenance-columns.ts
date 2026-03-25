import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {AlgoTableColumnFilterType, AlgoTableColumns} from '@algonomia/angular-sdk';
import {ISourceProvenanceExt} from '@otc/domain';
import {Type} from '@angular/core';
import {
    AlgoTableOrganizationTypeComponent
} from './algo-table-organization-type/algo-table-organization-type.component';
import {buildSortValue, buildDefaultValueGetter} from '../../_column-helpers';

export enum ESourceProvenanceColumnId {
    SourceName = 'SourceName',
    Organization = 'Organization',
    OrganizationType = 'OrganizationType',
    DateOfPublication = 'DateOfPublication'
}

export class SourceProvenanceColumns extends AEnhancedEnumFactory implements AlgoTableColumns<ISourceProvenanceExt> {
    static sourceName = new SourceProvenanceColumns(
        ESourceProvenanceColumnId.SourceName,
        'OTCFront.Sources.columns.SourceName.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.SourceName.info',
            valueGetter: x => x.source_name
        }
    );
    static organization = new SourceProvenanceColumns(
        ESourceProvenanceColumnId.Organization,
        'OTCFront.Sources.columns.Organization.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.Organization.info',
            valueGetter: x => x.organization
        }
    );
    static organizationType = new SourceProvenanceColumns(
        ESourceProvenanceColumnId.OrganizationType,
        'OTCFront.Sources.columns.OrganizationType.text',
        'list',
        {
            info: 'OTCFront.Sources.columns.OrganizationType.info',
            valueGetter: x => x.organization_type.text,
            renderComponent: AlgoTableOrganizationTypeComponent,
            renderInputs: (x: ISourceProvenanceExt) => ({
                organizationType: x.organization_type,
            })
        }
    );
    static dateOfPublication = new SourceProvenanceColumns(
        ESourceProvenanceColumnId.DateOfPublication,
        'OTCFront.Sources.columns.DateOfPublication.text',
        'date',
        {
            info: 'OTCFront.Sources.columns.DateOfPublication.info',
            valueGetter: x => x.hasOwnProperty('date_of_publication') ? x.date_of_publication?.toLocaleDateString() : undefined
        }
    );

    static getTitle(id: ESourceProvenanceColumnId): string {
        return (this.getByIdOrId(id) as SourceProvenanceColumns | undefined)?.title ?? id;
    }

    static getInfo(id: ESourceProvenanceColumnId): string {
        return (this.getByIdOrId(id) as SourceProvenanceColumns | undefined)?.info ?? id;
    }

    static getAllColumns() {
        return this.getAllAvailables() as SourceProvenanceColumns[];
    }

    readonly title: string;
    readonly info: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: ISourceProvenanceExt) => any;
    readonly sortValue: (x: ISourceProvenanceExt) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: ISourceProvenanceExt) => Record<string, unknown>;
    readonly pin?: 'left' | 'right';
    readonly show?: () => boolean | Promise<boolean>;

    private constructor(
        id: ESourceProvenanceColumnId,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            info?: string;
            valueGetter?: (x: ISourceProvenanceExt) => any;
            sortValue?: (x: ISourceProvenanceExt) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: ISourceProvenanceExt) => Record<string, unknown>;
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
