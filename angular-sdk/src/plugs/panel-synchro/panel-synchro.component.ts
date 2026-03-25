import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {ArrayUtils} from '@algonomia/ts-shared';
import {TranslatePipe} from '@ngx-translate/core';
import {NgTemplateOutlet} from '@angular/common';
import {SelectHandler} from '../../handlers/select-handler/select-handler';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {filter, firstValueFrom, ReplaySubject, switchMap, tap} from 'rxjs';
import {ScreenSize, WidthHeightListenerService} from '../../global-services/width-height-listener.service';
import {ScreenSizeHandlerComponent} from '../screen-size-handler/screen-size-handler.component';
import {ATemplateWithResizablesComponent} from '../../templates/template-resize-observer-component.abstract';
import {Tooltip} from 'primeng/tooltip';
import {SetHasPipe} from '../../pipes/set-has.pipe';

export interface IPanel {
    title: string;
    info?: string;
    logo: string;
    contentTpl: TemplateRef<unknown>;
    headerTpl?: TemplateRef<unknown>;
    subHeaderTpl?: TemplateRef<unknown>;
    defSelected: boolean;
    not_closable?: boolean;
    reverse_items?: boolean;
}

type Line = [IPanel, IPanel] | [IPanel];

@Component({
    selector: 'app-panel-synchro',
    imports: [AlgoIconComponent, TranslatePipe, NgTemplateOutlet, ScreenSizeHandlerComponent, Tooltip, SetHasPipe],
    templateUrl: './panel-synchro.component.html',
    styleUrl: './panel-synchro.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class PanelSynchroComponent extends ATemplateWithResizablesComponent implements AfterViewInit {
    @ViewChild('main') main!: ElementRef<HTMLDivElement>;

    @Input() set panels(panels: IPanel[]) {
        this.lines = this._toLines(panels);

        const selected = panels.filter(x => x.defSelected);
        this.selectHandler.changeList(panels, selected);
        if (panels.length > 0) {
            this._inited.next(true);
        }
    }
    private _inited = new ReplaySubject<boolean>(1);

    private _toLines(panels: IPanel[]): Line[] {
        return ArrayUtils.arrRange(0, Math.ceil(panels.length / 2) - 1).map(i => {
            if (!!panels[2 * i + 1]) {
                return [panels[2 * i], panels[2 * i + 1]];
            }
            return [panels[2 * i]];
        });
    }

    selectHandler = SelectHandler.getAtLeastOneSelectHandler<IPanel, IPanel>([]);
    lines: Line[] = [];

    __selectedPanels = new Set<IPanel>();
    __someSelectedLines = new Set<Line>();
    __allSelectedLines = new Set<Line>();
    __homogeneousLines = new Set<Line>();
    __countSelectedLines: number = 0;
    __countNonSelectedLines: number = 0;
    __selectedLineHeight: string = '';
    __contentHeight: string = '';
    __contentHeightWithSubHeader: string = '';

    __gap_inline = '10px';
    __gap = '1.55rem';
    __pad = '1.55rem';
    __headerWidth = '56px';
    __headerWidthWithGap = `calc(${this.__headerWidth} + ${this.__gap})`;
    __totalHeight = '0px';

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.pipeTakeUntil(WidthHeightListenerService.windowScreenListener).pipe(
            tap(x => {
                if (x === ScreenSize.normal) {
                    this.selectHandler = SelectHandler.getAtLeastOneSelectHandler<IPanel, IPanel>(this.selectHandler.list, [], this.selectHandler.selected);
                } else {
                    this.selectHandler = SelectHandler.getAlwaysOneSelectHandler<IPanel, IPanel>(this.selectHandler.list, [], this.selectHandler.selected);
                }

                const header_panel_size = getComputedStyle(this.main.nativeElement).getPropertyValue('--header-panel-size');
                const header_panel_size_mobile = getComputedStyle(this.main.nativeElement).getPropertyValue('--header-panel-size-mobile');

                if (x === ScreenSize.small) {
                    this.__headerWidth = header_panel_size_mobile;
                    this.__headerWidthWithGap = `calc(${header_panel_size_mobile} + ${this.__gap})`;
                } else {
                    this.__headerWidth = header_panel_size;
                    this.__headerWidthWithGap = `calc(${header_panel_size} + ${this.__gap})`;
                }
            }),
            switchMap(_ => this.resizeObservable()),
            switchMap(_ => this.selectHandler.selected$)
        ).subscribe(panels => {
            this.__totalHeight = `${this.main.nativeElement?.offsetHeight ?? 0}px`;
            this.__selectedPanels = new Set(panels);
            this.__someSelectedLines = new Set<Line>(
                this.lines.filter(line => line.some(panel => this.__selectedPanels.has(panel)))
            );
            this.__allSelectedLines = new Set<Line>(
                this.lines.filter(line => line.every(panel => this.__selectedPanels.has(panel)))
            );
            this.__homogeneousLines = new Set<Line>(
                this.lines.filter(line => line.length === 1 || !this.__someSelectedLines.has(line) || this.__allSelectedLines.has(line))
            );
            this.__countSelectedLines = this.__someSelectedLines.size;
            this.__countNonSelectedLines = this.lines.length - this.__someSelectedLines.size;
            const totalUnselectedHeight = `${this.__countNonSelectedLines} * ${this.__headerWidth}`;
            const gaps = `3 * ${this.__pad}`;
            this.__selectedLineHeight = `calc((${this.__totalHeight} - ${totalUnselectedHeight} - ${gaps}) / ${this.__countSelectedLines})`;
            this.__contentHeight = `calc(100% - ${this.__headerWidth})`;
            this.__contentHeightWithSubHeader = `calc(100% - ${this.__headerWidth} - ${this.__headerWidth})`;
            this._cd.markForCheck();
        });
    }

    async select(panel: IPanel) {
        await firstValueFrom(this._inited.pipe(filter(x => !!x))); // todo: used to handle concurrency issue, maybe find better way
        this.selectHandler.add(panel);
    }

    switch(panel: IPanel, line: Line) {
        if (this.selectHandler.selectedSize === 1 && this.selectHandler.isSelected(panel)) {
            if (line.length === 1) {
                const firstPanel = line?.at(0);
                if (firstPanel) {
                    this.selectHandler.replaceAll([firstPanel]);
                }
            } else {
                this.selectHandler.replaceAll(line.filter(x => x !== panel));
            }
        } else {
            this.selectHandler.switch(panel);
        }
    }
}
