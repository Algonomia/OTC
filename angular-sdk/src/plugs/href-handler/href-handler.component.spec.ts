import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HrefHandlerComponent, QueryParamsType } from './href-handler.component';

@Component({
    standalone: true,
    template: `
        <ng-template #testTpl>
            <span class="content">link</span>
        </ng-template>
        <app-href-handler [link]="link"
                          [queryParams]="params"
                          [template]="testTpl">
        </app-href-handler>
    `,
    imports: [HrefHandlerComponent]
})
class TestHostComponent {
    link = '/users';
    params: QueryParamsType = { id: 42 };
    @ViewChild(HrefHandlerComponent) component!: HrefHandlerComponent;
}

describe('HrefHandlerComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: HrefHandlerComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.component;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept link input', () => {
            expect(component.link).toBe('/users');
        });

        it('should accept queryParams input', () => {
            expect(component.queryParams).toEqual({ id: 42 });
        });

        it('should accept template input', () => {
            expect(component.template).toBeDefined();
        });

        it('should update link when host changes it', () => {
            host.link = '/products';
            fixture.detectChanges();

            expect(component.link).toBe('/products');
        });

        it('should update queryParams when host changes it', () => {
            host.params = { name: 'test', active: true };
            fixture.detectChanges();

            expect(component.queryParams).toEqual({ name: 'test', active: true });
        });
    });

    describe('Template Rendering', () => {
        it('should render the anchor element', () => {
            const anchor = fixture.nativeElement.querySelector('a');
            expect(anchor).toBeTruthy();
        });

        it('should render the provided template content', () => {
            const content = fixture.nativeElement.querySelector('.content');
            expect(content).toBeTruthy();
            expect(content.textContent).toBe('link');
        });

        it('should set routerLink on anchor', () => {
            const anchor = fixture.nativeElement.querySelector('a');
            expect(anchor.getAttribute('href')).toContain('/users');
        });

        it('should include query params in href', () => {
            const anchor = fixture.nativeElement.querySelector('a');
            const href = anchor.getAttribute('href') || '';
            expect(href).toContain('id=42');
        });
    });
});
