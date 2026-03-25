import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlgoIconComponent} from '../../design-elements/algo-icon/algo-icon/algo-icon.component';
import {
    ButtonNavigationComponent
} from '../../design-elements/buttons/buttons/button-navigation/button-navigation.component';
import {TranslatePipe} from '@ngx-translate/core';
import {apparitionAnimations} from '../../css/animations';

export interface IPanelInline {
    type: 'panel';
    title: string;
    icon: string;
    contentTpl: TemplateRef<unknown>;
    headerTpl?: TemplateRef<unknown>;
    subHeaderTpl?: TemplateRef<unknown>;
    defSelected: boolean;
}

export interface IPanelInlineImg {
    type: 'image';
    alt: string;
    path: string;
}

@Component({
    selector: 'app-panel-synchro-inline',
    imports: [
        CommonModule,
        AlgoIconComponent,
        ButtonNavigationComponent,
        TranslatePipe
    ],
    templateUrl: './panel-synchro-inline.component.html',
    styleUrl: './panel-synchro-inline.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [apparitionAnimations]
})
export class PanelSynchroInlineComponent {
    @Input() row_direction_column: boolean = true;
    @Input() show_navigation: boolean = true;
    @Input() set panels(panels: (IPanelInline | IPanelInlineImg)[]) {
        this.__panels = panels;
        const index = panels.findIndex(p => {
            return 'defSelected' in p ? p.defSelected : 0;
        });
        this.selectPanel(index !== -1 ? index : 0)
    }

    __panels: (IPanelInline | IPanelInlineImg)[] = [];
    animation_delay = 300;
    selectedIndex = 0;
    showContentIndex = 0;

    constructor(private _cd: ChangeDetectorRef) {}

    selectPanel(index: number): void {
        if (index !== this.selectedIndex) {
            this.selectedIndex = index;
            this.showContentIndex = -1;

            setTimeout(() => {
                this.showContentIndex = index;
                this._cd.markForCheck();
            }, this.animation_delay);
        }
    }

    getPreviousPanelTitle(index: number): string {
        const panel = this.__panels[index - 1];
        if (panel.type === 'image') {
            return this.getPreviousPanelTitle(index - 1);
        } else {
            return panel.title;
        }
    }

    getNextPanelTitle(index: number): string {
        const panel = this.__panels[index + 1];
        if (panel.type === 'image') {
            return this.getNextPanelTitle(index + 1);
        } else {
            return panel.title;
        }
    }

    goToPreviousPanelTitle(index: number): void {
        const panel = this.__panels[index - 1];
        if (panel.type === 'image') {
            this.goToPreviousPanelTitle(index - 1);
        } else {
            this.selectPanel(index - 1);
        }
    }

    goToNextPanelTitle(index: number): void {
        const panel = this.__panels[index + 1];
        if (panel.type === 'image') {
            this.goToNextPanelTitle(index + 1);
        } else {
            this.selectPanel(index + 1);
        }
    }
}
