import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MultiMetaFormControlComponent } from './multi-meta-form-control.component';
import { MetaFormControl } from '../metaforms';
import { AValidator, BaseMeta } from '@algonomia/ts-shared';

describe('MultiMetaFormControlComponent', () => {
    let component: MultiMetaFormControlComponent;
    let fixture: ComponentFixture<MultiMetaFormControlComponent>;

    function createMockMetaFormControl(required: boolean): MetaFormControl<any, any> {
        const mockValidator: AValidator<any, BaseMeta> = {
            errorCallbacks: [],
            meta: { required } as BaseMeta,
            validator_type: 'mock' as any,
            checkErrors: jasmine.createSpy('checkErrors').and.returnValue(null)
        };
        return new MetaFormControl(mockValidator, null);
    }

    function getRenderedMetaFormControls(): NodeListOf<Element> {
        return fixture.nativeElement.querySelectorAll('app-meta-form-control');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MultiMetaFormControlComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiMetaFormControlComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have hide_optionals as false by default', () => {
            expect(component.hide_optionals).toBe(false);
        });
    });

    describe('Conditional Rendering - Business Logic', () => {
        it('should render all controls (required and optional) when hide_optionals is false', () => {
            const mockControls = [
                createMockMetaFormControl(true),
                createMockMetaFormControl(false),
                createMockMetaFormControl(true),
                createMockMetaFormControl(false)
            ];

            fixture.componentRef.setInput('metaFormControls', mockControls);
            fixture.componentRef.setInput('hide_optionals', false);
            fixture.detectChanges();

            expect(getRenderedMetaFormControls().length).toBe(4);
        });

        it('should render only required controls when hide_optionals is true', () => {
            const mockControls = [
                createMockMetaFormControl(true),
                createMockMetaFormControl(false),
                createMockMetaFormControl(true),
                createMockMetaFormControl(false)
            ];

            fixture.componentRef.setInput('metaFormControls', mockControls);
            fixture.componentRef.setInput('hide_optionals', true);
            fixture.detectChanges();

            expect(getRenderedMetaFormControls().length).toBe(2);
        });

        it('should render all controls when all are required', () => {
            const mockControls = [
                createMockMetaFormControl(true),
                createMockMetaFormControl(true),
                createMockMetaFormControl(true)
            ];

            fixture.componentRef.setInput('metaFormControls', mockControls);
            fixture.componentRef.setInput('hide_optionals', true);
            fixture.detectChanges();

            expect(getRenderedMetaFormControls().length).toBe(3);
        });

        it('should render no controls when all are optional and hide_optionals is true', () => {
            const mockControls = [
                createMockMetaFormControl(false),
                createMockMetaFormControl(false),
                createMockMetaFormControl(false)
            ];

            fixture.componentRef.setInput('metaFormControls', mockControls);
            fixture.componentRef.setInput('hide_optionals', true);
            fixture.detectChanges();

            expect(getRenderedMetaFormControls().length).toBe(0);
        });

        it('should render no controls when array is empty', () => {
            fixture.componentRef.setInput('metaFormControls', []);
            fixture.detectChanges();

            expect(getRenderedMetaFormControls().length).toBe(0);
        });

        it('should update rendered controls when hide_optionals changes', () => {
            const mockControls = [
                createMockMetaFormControl(true),
                createMockMetaFormControl(false)
            ];

            fixture.componentRef.setInput('metaFormControls', mockControls);
            fixture.componentRef.setInput('hide_optionals', false);
            fixture.detectChanges();
            expect(getRenderedMetaFormControls().length).toBe(2);

            fixture.componentRef.setInput('hide_optionals', true);
            fixture.detectChanges();
            expect(getRenderedMetaFormControls().length).toBe(1);
        });
    });
});
