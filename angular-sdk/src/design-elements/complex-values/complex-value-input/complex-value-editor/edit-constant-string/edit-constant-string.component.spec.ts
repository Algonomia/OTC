import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditConstantStringComponent } from './edit-constant-string.component';
import { IStringConstant } from '@algonomia/ts-shared';

describe('EditConstantStringComponent', () => {
    let component: EditConstantStringComponent;
    let fixture: ComponentFixture<EditConstantStringComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditConstantStringComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(EditConstantStringComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('changeValue method', () => {
        it('should update stringComplexValue.value with input value', () => {
            const mockStringConstant: Partial<IStringConstant> = { value: 'old' };
            component.stringComplexValue = mockStringConstant as IStringConstant;

            const event = {
                target: { value: 'new value' }
            };

            component.changeValue(event);

            expect(component.stringComplexValue.value).toBe('new value');
        });

        it('should call markForCheck after value change', () => {
            const mockStringConstant: Partial<IStringConstant> = { value: 'old' };
            component.stringComplexValue = mockStringConstant as IStringConstant;

            const cdSpy = spyOn(component['_cd'], 'markForCheck');

            const event = {
                target: { value: 'new value' }
            };

            component.changeValue(event);

            expect(cdSpy).toHaveBeenCalled();
        });

        it('should handle empty string value', () => {
            const mockStringConstant: Partial<IStringConstant> = { value: 'old' };
            component.stringComplexValue = mockStringConstant as IStringConstant;

            const event = {
                target: { value: '' }
            };

            component.changeValue(event);

            expect(component.stringComplexValue.value).toBe('');
        });
    });
});
