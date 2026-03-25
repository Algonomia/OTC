import {Type} from '@angular/core';
import {IAction} from '../../design-elements/menus/std-actions-menu/std-actions-menu.component';
export type AlgoTableColumnFilterType = 'numeric' | 'text' | 'date' | 'boolean' | 'list' | 'none';

export interface AlgoTableColumns<Data> {
    id: any;
    readonly title: string | string[];
    readonly info?: string;

    frozen?: boolean;
    alignFrozen?: 'center' | 'left' | 'right';
    show?: (data: Data[]) => boolean | Promise<boolean>;

    readonly valueGetter: (x: Data) => unknown;
    readonly sortValue?: (x: Data) => unknown[];
    readonly filterType?: AlgoTableColumnFilterType;

    readonly onClickCell?: ((x: Data) => void) | IAction<Data[]>[];

    renderComponent?: Type<unknown> | ((x: Data) => Type<unknown> | undefined);
    renderInputs?: (data: Data) => Record<string, unknown>;
    pdfRenderFunction?: (data: Data) => string | string[];
    hideHeaderOnMobile?: boolean;
}

