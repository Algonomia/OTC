import {AEnhancedEnumFactory} from '@algonomia/ts-shared';
import {
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    AlgoTableFilesComponent,
    AlgoTableLinkIconComponent
} from '@algonomia/angular-sdk';
import {ISourceMedium} from '@otc/domain';
import {Type} from '@angular/core';
import {AppInjector} from '../../../injector';
import {DownloadOtcFilesService} from '../../files/download-otc-files.service';
import {buildSortValue, buildDefaultValueGetter} from '../../_column-helpers';

export enum ESourceMediumColumnId {
    Link = 'Link',
    Files = 'Files',
}

export class SourceMediumColumns extends AEnhancedEnumFactory implements AlgoTableColumns<ISourceMedium> {
    static link = new SourceMediumColumns(
        ESourceMediumColumnId.Link,
        'OTCFront.Sources.columns.Link.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.Link.info',
            valueGetter: x => x.link,
            renderComponent: AlgoTableLinkIconComponent,
            renderInputs: (x: ISourceMedium) => ({
                icon: 'People/Community/Link',
                text: x.link,
                link: x.link
            })
        }
    );
    static files = new SourceMediumColumns(
        ESourceMediumColumnId.Files,
        'OTCFront.Sources.columns.Files.text',
        'text',
        {
            info: 'OTCFront.Sources.columns.Files.info',
            valueGetter: x => x.files?.map(f => f.name).join(' / ') ?? '',
            renderComponent: AlgoTableFilesComponent,
            renderInputs: x => ({files: x.files, downloader: AppInjector.get(DownloadOtcFilesService)})
        }
    );

    static getTitle(id: ESourceMediumColumnId): string {
        return (this.getByIdOrId(id) as SourceMediumColumns | undefined)?.title ?? id;
    }

    static getInfo(id: ESourceMediumColumnId): string {
        return (this.getByIdOrId(id) as SourceMediumColumns | undefined)?.info ?? id;
    }

    static getAllColumns() {
        return this.getAllAvailables() as SourceMediumColumns[];
    }

    readonly title: string;
    readonly info: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly valueGetter: (x: ISourceMedium) => any;
    readonly sortValue: (x: ISourceMedium) => any;
    readonly renderComponent?: Type<unknown>;
    readonly renderInputs?: (data: ISourceMedium) => Record<string, unknown>;
    readonly pin?: 'left' | 'right';
    readonly show?: () => boolean | Promise<boolean>;

    private constructor(
        id: ESourceMediumColumnId,
        title: string,
        filterType: AlgoTableColumnFilterType,
        opts: {
            info?: string;
            valueGetter?: (x: ISourceMedium) => any;
            sortValue?: (x: ISourceMedium) => any;
            renderComponent?: Type<unknown>;
            renderInputs?: (data: ISourceMedium) => Record<string, unknown>;
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
