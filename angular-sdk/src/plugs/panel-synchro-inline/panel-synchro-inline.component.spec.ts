import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {IPanelInline, IPanelInlineImg, PanelSynchroInlineComponent} from './panel-synchro-inline.component';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
    template: `
        <ng-template #tpl>Test Content</ng-template>
        <app-panel-synchro-inline [panels]="panels"></app-panel-synchro-inline>
    `,
    standalone: true,
    imports: [PanelSynchroInlineComponent]
})
class TestHostComponent {
    @ViewChild('tpl', { static: true }) tpl!: TemplateRef<any>;
    panels: (IPanelInline | IPanelInlineImg)[] = [];
    component!: PanelSynchroInlineComponent;
}

describe('PanelSynchroInlineComponent', () => {
    let host: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot(), NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;

        host.panels = [
            { type: 'panel', title: 'A', icon: 'a', contentTpl: host.tpl, defSelected: true },
            { type: 'image', alt: 'img1', path: 'path1' },
            { type: 'panel', title: 'B', icon: 'b', contentTpl: host.tpl, defSelected: false },
        ];

        fixture.detectChanges();
        host.component = fixture.debugElement.children[0].componentInstance;
    });

    it('should create', () => {
        expect(host).toBeTruthy();
        expect(host.component).toBeTruthy();
    });

    it('should select default panel on input', () => {
        expect(host.component.selectedIndex).toBe(0);
    });

    it('should select first panel if no defSelected', () => {
        host.panels = [
            { type: 'panel', title: 'A', icon: 'a', contentTpl: host.tpl, defSelected: false },
            { type: 'panel', title: 'B', icon: 'b', contentTpl: host.tpl, defSelected: false },
        ];
        fixture.detectChanges();
        expect(host.component.selectedIndex).toBe(0);
    });

    it('should update selectedIndex and showContentIndex on selectPanel', fakeAsync(() => {
        host.component.selectPanel(2);
        expect(host.component.selectedIndex).toBe(2);
        expect(host.component.showContentIndex).toBe(-1);

        tick(host.component.animation_delay);
        expect(host.component.showContentIndex).toBe(2);
    }));

    it('should getPreviousPanelTitle skipping images', () => {
        expect(host.component.getPreviousPanelTitle(2)).toBe('A');
    });

    it('should getNextPanelTitle skipping images', () => {
        expect(host.component.getNextPanelTitle(0)).toBe('B');
    });

    it('should goToPreviousPanelTitle skipping images', fakeAsync(() => {
        host.component.selectedIndex = 2;
        host.component.showContentIndex = 2;
        host.component.goToPreviousPanelTitle(2);

        tick(host.component.animation_delay);
        expect(host.component.selectedIndex).toBe(0);
        expect(host.component.showContentIndex).toBe(0);
    }));

    it('should goToNextPanelTitle skipping images', fakeAsync(() => {
        host.component.selectedIndex = 0;
        host.component.showContentIndex = 0;
        host.component.goToNextPanelTitle(0);

        tick(host.component.animation_delay);
        expect(host.component.selectedIndex).toBe(2);
        expect(host.component.showContentIndex).toBe(2);
    }));
});
