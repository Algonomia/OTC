import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayRangeInputComponent } from './display-range-input.component';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

describe('DisplayRangeInputComponent', () => {
    let component: DisplayRangeInputComponent;
    let fixture: ComponentFixture<DisplayRangeInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DisplayRangeInputComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayRangeInputComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should have default min of 0', () => {
            expect(component.min).toBe(0);
        });

        it('should have default max of 100', () => {
            expect(component.max).toBe(100);
        });

        it('should have default step of 1', () => {
            expect(component.step).toBe(1);
        });

        it('should have default value of 0', () => {
            expect(component.value).toBe(0);
        });

        it('should have default editable of true', () => {
            expect(component.editable).toBe(true);
        });

        it('should have default resettable of true', () => {
            expect(component.resettable).toBe(true);
        });

        it('should accept min input', () => {
            fixture.componentRef.setInput('min', 5);
            expect(component.min).toBe(5);
        });

        it('should accept max input', () => {
            fixture.componentRef.setInput('max', 50);
            expect(component.max).toBe(50);
        });

        it('should accept step input', () => {
            fixture.componentRef.setInput('step', 2);
            expect(component.step).toBe(2);
        });

        it('should accept value input', () => {
            fixture.componentRef.setInput('value', 25);
            expect(component.value).toBe(25);
        });

        it('should accept editable input', () => {
            fixture.componentRef.setInput('editable', false);
            expect(component.editable).toBe(false);
        });

        it('should accept resettable input', () => {
            fixture.componentRef.setInput('resettable', false);
            expect(component.resettable).toBe(false);
        });
    });

    describe('validation', () => {
        describe('with range 0-10', () => {
            beforeEach(() => {
                fixture.componentRef.setInput('min', 0);
                fixture.componentRef.setInput('max', 10);
                fixture.detectChanges();
            });

            it('should be valid when value is within range', () => {
                fixture.componentRef.setInput('value', 5);
                fixture.detectChanges();

                expect(component.isValid).toBeTrue();
                expect(component.isInvalid).toBeFalse();
            });

            it('should be invalid when value is below min', () => {
                fixture.componentRef.setInput('value', -1);
                fixture.detectChanges();

                expect(component.isValid).toBeFalse();
                expect(component.isInvalid).toBeTrue();
            });

            it('should be invalid when value is above max', () => {
                fixture.componentRef.setInput('value', 20);
                fixture.detectChanges();

                expect(component.isValid).toBeFalse();
                expect(component.isInvalid).toBeTrue();
            });

            it('should be valid when value equals min', () => {
                fixture.componentRef.setInput('value', 0);
                fixture.detectChanges();

                expect(component.isValid).toBeTrue();
                expect(component.isInvalid).toBeFalse();
            });

            it('should be valid when value equals max', () => {
                fixture.componentRef.setInput('value', 10);
                fixture.detectChanges();

                expect(component.isValid).toBeTrue();
                expect(component.isInvalid).toBeFalse();
            });
        });
    });

    describe('ControlValueAccessor', () => {
        it('should write value using writeValue', () => {
            component.writeValue(7);
            expect(component.value).toBe(7);
        });

        it('should fallback to min when writeValue receives null', () => {
            fixture.componentRef.setInput('min', 0);
            fixture.detectChanges();

            component.writeValue(null);

            expect(component.value).toBe(0);
        });

        it('should fallback to custom min when writeValue receives null', () => {
            fixture.componentRef.setInput('min', 5);
            fixture.detectChanges();

            component.writeValue(null);

            expect(component.value).toBe(5);
        });

        it('should register onChange callback', () => {
            const onChangeSpy = jasmine.createSpy('onChange');
            component.registerOnChange(onChangeSpy);

            component.setValue(6);

            expect(onChangeSpy).toHaveBeenCalledWith(6);
        });

        it('should register onTouched callback', () => {
            const onTouchedSpy = jasmine.createSpy('onTouched');
            component.registerOnTouched(onTouchedSpy);

            component.setValue(6);

            expect(onTouchedSpy).toHaveBeenCalled();
        });

        it('should disable editing when setDisabledState(true)', () => {
            component.setDisabledState?.(true);
            expect(component.editable).toBeFalse();
        });

        it('should enable editing when setDisabledState(false)', () => {
            component.setDisabledState?.(false);
            expect(component.editable).toBeTrue();
        });
    });

    describe('events', () => {
        it('should emit clickValue when editable', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('editable', true);
            fixture.detectChanges();

            component.setValue(8);

            expect(component.clickValue.emit).toHaveBeenCalledWith(8);
        });

        it('should not emit clickValue when not editable', () => {
            spyOn(component.clickValue, 'emit');
            fixture.componentRef.setInput('editable', false);
            fixture.detectChanges();

            component.setValue(8);

            expect(component.clickValue.emit).not.toHaveBeenCalled();
        });
    });

    describe('value manipulation', () => {
        describe('with range 0-10 and step 1', () => {
            beforeEach(() => {
                fixture.componentRef.setInput('min', 0);
                fixture.componentRef.setInput('max', 10);
                fixture.componentRef.setInput('step', 1);
                fixture.detectChanges();
            });

            it('should increment value respecting max', () => {
                fixture.componentRef.setInput('value', 9);
                fixture.detectChanges();

                component.incrementValue();
                expect(component.value).toBe(10);

                component.incrementValue();
                expect(component.value).toBe(10);
            });

            it('should decrement value respecting min', () => {
                fixture.componentRef.setInput('value', 1);
                fixture.detectChanges();

                component.decrementValue();
                expect(component.value).toBe(0);

                component.decrementValue();
                expect(component.value).toBe(0);
            });

            it('should reset value to min', () => {
                fixture.componentRef.setInput('value', 7);
                fixture.detectChanges();

                component.resetValue();
                expect(component.value).toBe(0);
            });
        });

        describe('with range 0-10 and step 2', () => {
            beforeEach(() => {
                fixture.componentRef.setInput('min', 0);
                fixture.componentRef.setInput('max', 10);
                fixture.componentRef.setInput('step', 2);
                fixture.detectChanges();
            });

            it('should increment value by step', () => {
                fixture.componentRef.setInput('value', 4);
                fixture.detectChanges();

                component.incrementValue();
                expect(component.value).toBe(6);
            });

            it('should decrement value by step', () => {
                fixture.componentRef.setInput('value', 6);
                fixture.detectChanges();

                component.decrementValue();
                expect(component.value).toBe(4);
            });
        });

        it('should reset value to custom min', () => {
            fixture.componentRef.setInput('min', 5);
            fixture.componentRef.setInput('max', 15);
            fixture.componentRef.setInput('value', 10);
            fixture.detectChanges();

            component.resetValue();
            expect(component.value).toBe(5);
        });
    });

    describe('DOM interactions', () => {
        describe('with range 0-10', () => {
            beforeEach(() => {
                fixture.componentRef.setInput('min', 0);
                fixture.componentRef.setInput('max', 10);
                fixture.detectChanges();
            });

            it('should update value on number input', () => {
                const input = fixture.debugElement.query(
                    By.css('input[type="number"]')
                ).nativeElement as HTMLInputElement;

                input.value = '6';
                input.dispatchEvent(new Event('input'));

                expect(component.value).toBe(6);
            });

            it('should reset to min on blur if input is empty', () => {
                const input = fixture.debugElement.query(
                    By.css('input[type="number"]')
                ).nativeElement as HTMLInputElement;

                input.value = '';
                input.dispatchEvent(new Event('blur'));

                expect(component.value).toBe(0);
            });

            it('should update value on range input', () => {
                const input = fixture.debugElement.query(
                    By.css('input[type="range"]')
                ).nativeElement as HTMLInputElement;

                input.value = '7';
                input.dispatchEvent(new Event('input'));

                expect(component.value).toBe(7);
            });
        });

        it('should reset to custom min on blur if input is empty', () => {
            fixture.componentRef.setInput('min', 3);
            fixture.componentRef.setInput('max', 10);
            fixture.detectChanges();

            const input = fixture.debugElement.query(
                By.css('input[type="number"]')
            ).nativeElement as HTMLInputElement;

            input.value = '';
            input.dispatchEvent(new Event('blur'));

            expect(component.value).toBe(3);
        });
    });
});
