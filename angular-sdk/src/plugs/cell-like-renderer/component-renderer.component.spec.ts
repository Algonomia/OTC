import { ComponentFixture, TestBed } from '@angular/core/testing';
import {Component, Type, ViewChild} from '@angular/core';
import { By } from '@angular/platform-browser';
import {ComponentRendererComponent} from './component-renderer.component';

@Component({
    selector: 'app-test-cell',
    template: `{{ value }}`,
    standalone: true
})
class TestCellComponent {
    value!: string;
    data!: unknown;
}

@Component({
    selector: 'app-other-cell',
    template: `<span>Other: {{ label }}</span>`,
    standalone: true
})
class OtherCellComponent {
    label!: string;
}

@Component({
    standalone: true,
    imports: [ComponentRendererComponent],
    template: `
        <app-component-renderer
            [renderComponent]="renderComponent"
            [renderInputs]="renderInputs"
            [data]="data">
        </app-component-renderer>
    `
})
class TestHostComponent {
    @ViewChild(ComponentRendererComponent) renderCell!: ComponentRendererComponent<unknown>;
    renderComponent: Type<unknown>= TestCellComponent;
    renderInputs?: (data: unknown) => Record<string, unknown>;
    data: unknown = '';
}

describe('ComponentRendererComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: ComponentRendererComponent<unknown>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TestCellComponent, OtherCellComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.renderCell;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Component Creation', () => {
        it('should dynamically create the component with the inputs', () => {
            host.data = 'hello';
            host.renderInputs = data => ({ value: data });
            fixture.detectChanges();

            const cell = fixture.debugElement.query(By.directive(TestCellComponent));
            expect(cell).toBeTruthy();
            expect((cell.componentInstance as TestCellComponent).value).toBe('hello');
        });

        it('should use default inputs when renderInputs is not provided', () => {
            host.data = { id: 1, name: 'test' };
            host.renderInputs = undefined;
            fixture.detectChanges();

            const cell = fixture.debugElement.query(By.directive(TestCellComponent));
            expect(cell).toBeTruthy();
            expect((cell.componentInstance as TestCellComponent).data).toEqual({ id: 1, name: 'test' });
        });

        it('should recreate component when renderComponent changes', () => {
            host.data = 'hello';
            host.renderInputs = data => ({ value: data });
            fixture.detectChanges();

            const firstCell = fixture.debugElement.query(By.directive(TestCellComponent));
            expect(firstCell).toBeTruthy();

            host.renderComponent = OtherCellComponent;
            host.renderInputs = data => ({ label: data });
            fixture.detectChanges();

            const oldCell = fixture.debugElement.query(By.directive(TestCellComponent));
            const newCell = fixture.debugElement.query(By.directive(OtherCellComponent));

            expect(oldCell).toBeNull();
            expect(newCell).toBeTruthy();
            expect((newCell.componentInstance as OtherCellComponent).label).toBe('hello');
        });
    });

    describe('Input Updates', () => {
        it('should update existing inputs if data changes', () => {
            host.data = 'first';
            host.renderInputs = data => ({ value: data });
            fixture.detectChanges();

            host.data = 'updated';
            fixture.detectChanges();

            const cell = fixture.debugElement.query(By.directive(TestCellComponent));
            expect((cell.componentInstance as TestCellComponent).value).toBe('updated');
        });

        it('should update the rendered value when data changes (OnPush safe)', () => {
            host.data = 'hello';
            host.renderInputs = data => ({ value: data });
            fixture.detectChanges();

            host.data = 'updated';
            fixture.detectChanges();

            const cell = fixture.debugElement.query(By.directive(TestCellComponent));
            expect(cell.nativeElement.textContent).toContain('updated');
        });

    });
});
