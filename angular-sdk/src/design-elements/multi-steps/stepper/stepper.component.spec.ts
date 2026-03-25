import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { TranslateModule } from '@ngx-translate/core';

describe('StepperComponent', () => {
    let component: StepperComponent;
    let fixture: ComponentFixture<StepperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepperComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StepperComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should have default currentStep of 0', () => {
            expect(component.currentStep).toBe(0);
        });

        it('should have default totalSteps of 0', () => {
            expect(component.totalSteps).toBe(0);
        });

        it('should accept currentStep input', () => {
            fixture.componentRef.setInput('currentStep', 3);
            expect(component.currentStep).toBe(3);
        });

        it('should accept totalSteps input', () => {
            fixture.componentRef.setInput('totalSteps', 5);
            expect(component.totalSteps).toBe(5);
        });

        describe('stepsArray getter', () => {
            it('should generate correct stepsArray for totalSteps', () => {
                fixture.componentRef.setInput('totalSteps', 5);
                expect(component.stepsArray).toEqual([0, 1, 2, 3, 4]);
            });

            it('should generate empty stepsArray when totalSteps is 0', () => {
                fixture.componentRef.setInput('totalSteps', 0);
                expect(component.stepsArray).toEqual([]);
            });

            it('should regenerate stepsArray when totalSteps changes', () => {
                fixture.componentRef.setInput('totalSteps', 3);
                expect(component.stepsArray).toEqual([0, 1, 2]);

                fixture.componentRef.setInput('totalSteps', 5);
                expect(component.stepsArray).toEqual([0, 1, 2, 3, 4]);

                fixture.componentRef.setInput('totalSteps', 2);
                expect(component.stepsArray).toEqual([0, 1]);
            });
        });
    });

    describe('Template Rendering', () => {
        describe('Step Circles', () => {
            it('should render correct number of step circles', () => {
                fixture.componentRef.setInput('totalSteps', 4);
                fixture.detectChanges();

                const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles.length).toBe(4);
            });

            it('should not render any step circles when totalSteps is 0', () => {
                fixture.componentRef.setInput('totalSteps', 0);
                fixture.detectChanges();

                const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles.length).toBe(0);
            });
        });

        describe('Active Step', () => {
            it('should mark first step as active by default', () => {
                fixture.componentRef.setInput('totalSteps', 5);
                fixture.componentRef.setInput('currentStep', 0);
                fixture.detectChanges();

                const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles[0].classList.contains('active')).toBe(true);
                expect(stepCircles[1].classList.contains('active')).toBe(false);
            });

            it('should mark correct step as active when currentStep is 2', () => {
                fixture.componentRef.setInput('totalSteps', 5);
                fixture.componentRef.setInput('currentStep', 2);
                fixture.detectChanges();

                const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles[0].classList.contains('active')).toBe(false);
                expect(stepCircles[1].classList.contains('active')).toBe(false);
                expect(stepCircles[2].classList.contains('active')).toBe(true);
                expect(stepCircles[3].classList.contains('active')).toBe(false);
                expect(stepCircles[4].classList.contains('active')).toBe(false);
            });

            it('should mark last step as active', () => {
                fixture.componentRef.setInput('totalSteps', 3);
                fixture.componentRef.setInput('currentStep', 2);
                fixture.detectChanges();

                const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles[0].classList.contains('active')).toBe(false);
                expect(stepCircles[1].classList.contains('active')).toBe(false);
                expect(stepCircles[2].classList.contains('active')).toBe(true);
            });

            it('should update active step when currentStep input changes', () => {
                fixture.componentRef.setInput('totalSteps', 4);
                fixture.componentRef.setInput('currentStep', 0);
                fixture.detectChanges();

                let stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles[0].classList.contains('active')).toBe(true);
                expect(stepCircles[3].classList.contains('active')).toBe(false);

                fixture.componentRef.setInput('currentStep', 3);
                fixture.detectChanges();

                stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                expect(stepCircles[0].classList.contains('active')).toBe(false);
                expect(stepCircles[3].classList.contains('active')).toBe(true);
            });

            it('should have only one active step at a time', () => {
                fixture.componentRef.setInput('totalSteps', 6);
                fixture.componentRef.setInput('currentStep', 3);
                fixture.detectChanges();

                const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
                const activeSteps = Array.from(stepCircles as NodeListOf<Element>).filter((circle) =>
                    circle.classList.contains('active')
                );

                expect(activeSteps.length).toBe(1);
            });
        });

        describe('Container', () => {
            it('should have correct container classes', () => {
                fixture.componentRef.setInput('totalSteps', 3);
                fixture.detectChanges();

                const container = fixture.nativeElement.querySelector('.stepper');
                expect(container).toBeTruthy();
                expect(container.classList.contains('flex')).toBe(true);
                expect(container.classList.contains('items-center')).toBe(true);
                expect(container.classList.contains('justify-center')).toBe(true);
                expect(container.classList.contains('gap-2')).toBe(true);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should not render stepper with single step', () => {
            fixture.componentRef.setInput('totalSteps', 1);
            fixture.componentRef.setInput('currentStep', 0);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.stepper');
            expect(container).toBeNull();

            const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
            expect(stepCircles.length).toBe(0);
        });

        it('should render stepper with two steps', () => {
            fixture.componentRef.setInput('totalSteps', 2);
            fixture.componentRef.setInput('currentStep', 0);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.stepper');
            expect(container).toBeTruthy();

            const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
            expect(stepCircles.length).toBe(2);
            expect(stepCircles[0].classList.contains('active')).toBe(true);
            expect(stepCircles[1].classList.contains('active')).toBe(false);
        });

        it('should handle large number of steps', () => {
            fixture.componentRef.setInput('totalSteps', 20);
            fixture.componentRef.setInput('currentStep', 10);
            fixture.detectChanges();

            const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
            expect(stepCircles.length).toBe(20);
            expect(stepCircles[10].classList.contains('active')).toBe(true);
        });

        it('should not mark any step as active when currentStep is out of range', () => {
            fixture.componentRef.setInput('totalSteps', 3);
            fixture.componentRef.setInput('currentStep', 5);
            fixture.detectChanges();

            const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
            const activeSteps = Array.from(stepCircles as NodeListOf<Element>).filter((circle) =>
                circle.classList.contains('active')
            );

            expect(activeSteps.length).toBe(0);
        });

        it('should handle negative currentStep', () => {
            fixture.componentRef.setInput('totalSteps', 3);
            fixture.componentRef.setInput('currentStep', -1);
            fixture.detectChanges();

            const stepCircles = fixture.nativeElement.querySelectorAll('.step-circle');
            const activeSteps = Array.from(stepCircles as NodeListOf<Element>).filter((circle) =>
                circle.classList.contains('active')
            );

            expect(activeSteps.length).toBe(0);
        });
    });
});
