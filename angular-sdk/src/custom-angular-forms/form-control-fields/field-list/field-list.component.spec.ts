import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldListComponent } from './field-list.component';
import { ListMeta, AlgoMonoListValidator, AlgoMultiListValidator } from '@algonomia/ts-shared';
import { MetaFormControl } from '../../metaforms';
import { ListFormControlComponent } from '../../../design-elements/form-controls/list-form-control/list-form-control.component';
import { By } from '@angular/platform-browser';
import {DialogService} from 'primeng/dynamicdialog';

describe('FieldListComponent', () => {
    let component: FieldListComponent<any, any>;
    let fixture: ComponentFixture<FieldListComponent<any, any>>;

    const mockList = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

    function createMockSingleSelectControl(
        value: string | null = null,
        meta: Partial<ListMeta<string, string>> = {}
    ): MetaFormControl<string | null, ListMeta<string, string>> {
        const defaultMeta: ListMeta<string, string> = {
            label: 'Test Single Select',
            required: false,
            placeholder: 'Select one',
            list: mockList,
            ...meta
        };
        const validator = new AlgoMonoListValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<string | null, ListMeta<string, string>>;
    }

    function createMockMultiSelectControl(
        value: string[] | null = null,
        meta: Partial<ListMeta<string, string>> = {}
    ): MetaFormControl<string[] | null, ListMeta<string, string>> {
        const defaultMeta: ListMeta<string, string> = {
            label: 'Test Multi Select',
            required: false,
            placeholder: 'Select multiple',
            list: mockList,
            ...meta
        };
        const validator = new AlgoMultiListValidator(defaultMeta);
        return new MetaFormControl(validator, value) as MetaFormControl<string[] | null, ListMeta<string, string>>;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FieldListComponent,
                TranslateModule.forRoot(),
                ListFormControlComponent
            ],
            providers: [
                DialogService,
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FieldListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Single Selection', () => {
        it('should accept single select formControl', () => {
            const mockControl = createMockSingleSelectControl('Option 1');

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component['__formControl']).toBe(mockControl);
            expect(component['__multiple']).toBe(false);
        });

        it('should create mono select handler for single selection', () => {
            const mockControl = createMockSingleSelectControl('Option 2');

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__selectHandler']).toBeDefined();
            expect(component['__multiple']).toBe(false);
        });

        it('should render ListFormControlComponent with single selection', () => {
            const mockControl = createMockSingleSelectControl('Option 1');

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            expect(listDebug).toBeTruthy();

            const listComponent = listDebug.componentInstance;
            expect(listComponent.multiple).toBe(false);
        });

        it('should pass correct properties for single selection', () => {
            const mockControl = createMockSingleSelectControl('Option 1', {
                label: 'Choose One',
                required: true,
                placeholder: 'Pick one option'
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            const listComponent = listDebug.componentInstance;

            expect(listComponent.label).toBe('Choose One');
            expect(listComponent.required).toBe(true);
            expect(listComponent.placeholder).toBe('Pick one option');
            expect(listComponent.formControl).toBe(mockControl);
        });
    });

    describe('Multiple Selection', () => {
        it('should accept multi select formControl', () => {
            const mockControl = createMockMultiSelectControl(['Option 1', 'Option 2']);

            fixture.componentRef.setInput('formControl', mockControl);

            expect(component['__formControl']).toBe(mockControl);
            expect(component['__multiple']).toBe(true);
        });

        it('should create multi select handler for multiple selection', () => {
            const mockControl = createMockMultiSelectControl(['Option 1']);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__selectHandler']).toBeDefined();
            expect(component['__multiple']).toBe(true);
        });

        it('should render ListFormControlComponent with multiple selection', () => {
            const mockControl = createMockMultiSelectControl(['Option 1', 'Option 3']);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            expect(listDebug).toBeTruthy();

            const listComponent = listDebug.componentInstance;
            expect(listComponent.multiple).toBe(true);
        });

        it('should pass correct properties for multiple selection', () => {
            const mockControl = createMockMultiSelectControl(['Option 1'], {
                label: 'Choose Multiple',
                required: true,
                placeholder: 'Pick options',
                minLength: 1,
                maxLength: 3
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            const listComponent = listDebug.componentInstance;

            expect(listComponent.label).toBe('Choose Multiple');
            expect(listComponent.required).toBe(true);
            expect(listComponent.placeholder).toBe('Pick options');
            expect(listComponent.formControl).toBe(mockControl);
        });
    });

    describe('Template Rendering', () => {
        it('should not render when formControl is not provided', () => {
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            expect(listDebug).toBeNull();
        });

        it('should render when formControl is provided', () => {
            const mockControl = createMockSingleSelectControl('Option 1');

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            expect(listDebug).toBeTruthy();
        });

        it('should update when formControl changes', () => {
            const mockControl1 = createMockSingleSelectControl('Option 1', { label: 'Label 1' });
            fixture.componentRef.setInput('formControl', mockControl1);
            fixture.detectChanges();

            let listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            let listComponent = listDebug.componentInstance;
            expect(listComponent.label).toBe('Label 1');

            const mockControl2 = createMockSingleSelectControl('Option 2', { label: 'Label 2' });
            fixture.componentRef.setInput('formControl', mockControl2);
            fixture.detectChanges();

            listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            listComponent = listDebug.componentInstance;
            expect(listComponent.label).toBe('Label 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null value for single selection', () => {
            const mockControl = createMockSingleSelectControl(null);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__formControl'].value).toBeNull();
            expect(component['__multiple']).toBe(false);
        });

        it('should handle null value for multiple selection', () => {
            const mockControl = createMockMultiSelectControl(null);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__formControl'].value).toBeNull();
            expect(component['__multiple']).toBe(true);
        });

        it('should handle empty array for multiple selection', () => {
            const mockControl = createMockMultiSelectControl([]);

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__formControl'].value).toEqual([]);
            expect(component['__multiple']).toBe(true);
        });

        it('should handle emptySelectionIsNull option', () => {
            const mockControl = createMockSingleSelectControl(null, {
                emptySelectionIsNull: true
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            const listComponent = listDebug.componentInstance;
            expect(listComponent.emptySelectionIsNull).toBe(true);
        });

        it('should handle required field', () => {
            const mockControl = createMockSingleSelectControl('Option 1', { required: true });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            const listComponent = listDebug.componentInstance;
            expect(listComponent.required).toBe(true);
        });

        it('should handle optional field', () => {
            const mockControl = createMockSingleSelectControl('Option 1', { required: false });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            const listDebug = fixture.debugElement.query(By.directive(ListFormControlComponent));
            const listComponent = listDebug.componentInstance;
            expect(listComponent.required).toBe(false);
        });

        it('should handle empty list', () => {
            const mockControl = createMockSingleSelectControl(null, { list: [] });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__selectHandler']).toBeDefined();
        });

        it('should handle list with single item', () => {
            const mockControl = createMockSingleSelectControl('Only Option', {
                list: ['Only Option']
            });

            fixture.componentRef.setInput('formControl', mockControl);
            fixture.detectChanges();

            expect(component['__selectHandler']).toBeDefined();
        });

        it('should create new select handler when formControl changes', () => {
            const mockControl1 = createMockSingleSelectControl('Option 1');
            fixture.componentRef.setInput('formControl', mockControl1);
            const handler1 = component['__selectHandler'];

            const mockControl2 = createMockSingleSelectControl('Option 2');
            fixture.componentRef.setInput('formControl', mockControl2);
            const handler2 = component['__selectHandler'];

            expect(handler1).not.toBe(handler2);
        });
    });
});
