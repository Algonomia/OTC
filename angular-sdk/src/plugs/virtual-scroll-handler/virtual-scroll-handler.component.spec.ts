import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualScrollHandlerComponent } from './virtual-scroll-handler.component';
import {TemplateRef, Component, ViewChild} from '@angular/core';

@Component({
    template: `
        <ng-template #tpl let-line_value let-idx="idx">
            {{ idx }} - {{ line_value }}
        </ng-template>
    `,
    standalone: true,
})
class MenuTemplateHostComponent {
    @ViewChild('tpl', { static: true }) tpl!: TemplateRef<any>;
}

describe('VirtualScrollHandlerComponent', () => {
    let fixture: ComponentFixture<VirtualScrollHandlerComponent>;
    let component: VirtualScrollHandlerComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VirtualScrollHandlerComponent, MenuTemplateHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VirtualScrollHandlerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update lineHeight and bufferHeight when lineHeightPx changes', () => {
        fixture.componentRef.setInput('lineHeightPx', 50);
        expect(component.__lineHeightPx).toBe(50);
        expect(component.__bufferHeightPx).toBe(500);
    });

    it('should accept array for line_values', () => {
        fixture.componentRef.setInput('line_values', [1, 2, 3]);
        expect(component.__line_values).toEqual([1, 2, 3]);
    });

    it('should accept set for line_values', () => {
        fixture.componentRef.setInput('line_values', new Set([1, 2, 3]));
        expect(component.__line_values).toEqual([1, 2, 3]);
    });

    it('should accept menuLineTemplate input', () => {
        const host = TestBed.createComponent(MenuTemplateHostComponent);

        fixture.componentRef.setInput('menuLineTemplate', host.componentInstance.tpl);
        fixture.componentRef.setInput('line_values', [1]);
        fixture.detectChanges();

        expect(component.menuLineTemplate).toBeTruthy();
    });
});
