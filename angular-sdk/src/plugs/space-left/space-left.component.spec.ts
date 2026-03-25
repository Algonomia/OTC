import { Component, ViewChild, TemplateRef } from '@angular/core';
import { SpaceLeftComponent } from './space-left.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

@Component({
    template: `
        <app-space-left
            [firstTpl]="firstTpl"
            [secondTpl]="secondTpl"
            [minHeight]="minHeight">
        </app-space-left>

        <ng-template #firstTpl>
            <div class="first-content" style="height: 100px;"></div>
        </ng-template>

        <ng-template #secondTpl>
            <div class="second-content"></div>
        </ng-template>
    `,
    standalone: true,
    imports: [SpaceLeftComponent]
})
class TestHostComponent {
    minHeight = 50;
    @ViewChild(SpaceLeftComponent) comp!: SpaceLeftComponent;
    @ViewChild('firstTpl') firstTpl!: TemplateRef<any>;
    @ViewChild('secondTpl') secondTpl!: TemplateRef<any>;
}

describe('SpaceLeftComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: SpaceLeftComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();

        component = host.comp;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should receive template inputs', () => {
        expect(component.firstTpl).toBeTruthy();
        expect(component.secondTpl).toBeTruthy();
    });

    it('should have ViewChild elements initialized after init', () => {
        expect(component.first).toBeTruthy();
        expect(component.second).toBeTruthy();
    });

    describe('recalc', () => {
        beforeEach(() => {
            const parentHeight = 300;

            Object.defineProperty(
                component.first.nativeElement,
                'offsetHeight',
                { value: 100 }
            );

            Object.defineProperty(
                component.first.nativeElement.parentElement,
                'clientHeight',
                { value: parentHeight }
            );
        });

        it('should calculate secondHeight correctly', () => {
            component.recalc();
            expect(component.secondHeight).toBe(200);
        });

        it('should respect minHeight when space is too small', () => {
            host.minHeight = 350;
            fixture.detectChanges();
            component.recalc();
            expect(component.secondHeight).toBe(350);
        });

        it('should call markForCheck() on recalc', () => {
            const spy = spyOn(component['_cd'], 'markForCheck');
            component.recalc();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('should recompute height on resize observable', () => {
        const spy = spyOn(component, 'recalc');
        spyOn(component, 'resizeObservable').and.returnValue(of(null));
        component.ngAfterViewInit();
        expect(spy).toHaveBeenCalled();
    });
});
