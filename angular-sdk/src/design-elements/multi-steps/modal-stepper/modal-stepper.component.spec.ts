import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalStepperComponent, ModalStep } from './modal-stepper.component';
import { ModalService } from '../../../global-services/modal.service';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-stepper',
    standalone: true,
    template: `<div class="stepper-mock">{{currentStep}}/{{totalSteps}}</div>`
})
class MockStepperComponent {
    @Input() currentStep = 0;
    @Input() totalSteps = 0;
}

@Component({
    selector: 'app-algo-icon',
    standalone: true,
    template: `<span class="icon-{{name}}"></span>`
})
class MockAlgoIconComponent {
    @Input() name!: string;
}

class MockModalService {
    close = jasmine.createSpy('close');
}

@Component({
    template: `
        <ng-template #testTemplate>
            <div class="test-content">Test Content</div>
        </ng-template>
        <ng-template #buttonTemplate>
            <button class="test-button">Test Button</button>
        </ng-template>
    `,
    standalone: true
})
class TemplateHelperComponent {
    @ViewChild('testTemplate', { static: true }) testTemplate!: TemplateRef<unknown>;
    @ViewChild('buttonTemplate', { static: true }) buttonTemplate!: TemplateRef<unknown>;
}

describe('ModalStepperComponent', () => {
    let component: ModalStepperComponent<string>;
    let fixture: ComponentFixture<ModalStepperComponent<string>>;
    let modalService: Partial<ModalService>;
    let templateHelper: TemplateHelperComponent;
    let templateFixture: ComponentFixture<TemplateHelperComponent>;

    function createModalStep(
        id: string,
        options: Partial<ModalStep<string>> = {}
    ): ModalStep<string> {
        return {
            id,
            templateRef: templateHelper.testTemplate,
            buttonsRef: [templateHelper.buttonTemplate],
            ...options
        };
    }

    function createModalSteps(...stepIds: string[][]): ModalStep<string>[][] {
        return stepIds.map(group => group.map(id => createModalStep(id)));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ModalStepperComponent,
                MockStepperComponent,
                MockAlgoIconComponent,
                TranslateModule.forRoot(),
                TemplateHelperComponent
            ],
            providers: [
                { provide: ModalService, useClass: MockModalService }
            ]
        }).overrideComponent(ModalStepperComponent, {
            set: {
                imports: [
                    NgTemplateOutlet,
                    MockStepperComponent,
                    MockAlgoIconComponent,
                    TranslateModule
                ]
            }
        }).compileComponents();

        modalService = TestBed.inject(ModalService);

        templateFixture = TestBed.createComponent(TemplateHelperComponent);
        templateHelper = templateFixture.componentInstance;
        templateFixture.detectChanges();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalStepperComponent<string>);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should have default values', () => {
            expect(component['__modalSteps']).toEqual([]);
            expect(component['__currentStepGroupIdx']).toBe(0);
            expect(component['__totalStep']).toBe(0);
            expect(component['__currentStep']).toBeUndefined();
            expect(component.canGoBack).toBe(true);
        });

        it('should accept modalSteps input and initialize current step', () => {
            const modalSteps = createModalSteps(['step1'], ['step2']);

            fixture.componentRef.setInput('modalSteps', modalSteps);

            expect(component['__modalSteps']).toBe(modalSteps);
            expect(component['__totalStep']).toBe(2);
            expect(component['__currentStepGroupIdx']).toBe(0);
            expect(component['__currentStep']).toBe(modalSteps[0][0]);
        });

        it('should accept canGoBack input', () => {
            fixture.componentRef.setInput('canGoBack', false);
            expect(component.canGoBack).toBe(false);
        });

        it('should calculate totalStep excluding ignored steps', () => {
            const modalSteps: ModalStep<string>[][] = [
                [createModalStep('step1')],
                [createModalStep('step2', { ignoreIdx: true })],
                [createModalStep('step3')]
            ];

            fixture.componentRef.setInput('modalSteps', modalSteps);

            expect(component['__totalStep']).toBe(2);
        });
    });

    describe('Navigation Methods', () => {
        describe('getIdx', () => {
            it('should return current step group index', () => {
                const modalSteps = createModalSteps(['step1']);
                fixture.componentRef.setInput('modalSteps', modalSteps);

                expect(component.getIdx()).toBe(0);
            });
        });

        describe('next', () => {
            it('should go to next step with single option', () => {
                const modalSteps = createModalSteps(['step1'], ['step2']);
                fixture.componentRef.setInput('modalSteps', modalSteps);

                component.next();

                expect(component['__currentStepGroupIdx']).toBe(1);
                expect(component['__currentStep']).toBe(modalSteps[1][0]);
            });

            it('should not go to next step with multiple options', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1')],
                    [createModalStep('step2a'), createModalStep('step2b')]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);

                const initialStep = component['__currentStep'];
                component.next();

                expect(component['__currentStepGroupIdx']).toBe(0);
                expect(component['__currentStep']).toBe(initialStep);
            });

            it('should go to specific step by id', () => {
                const modalSteps = createModalSteps(['step1'], ['step2'], ['step3']);
                fixture.componentRef.setInput('modalSteps', modalSteps);

                component.next('step3');

                expect(component['__currentStepGroupIdx']).toBe(2);
                expect(component['__currentStep']).toBe(modalSteps[2][0]);
            });

            it('should set currentStep to undefined if id not found', () => {
                const modalSteps = createModalSteps(['step1']);
                fixture.componentRef.setInput('modalSteps', modalSteps);

                component.next('nonexistent');

                expect(component['__currentStep']).toBeUndefined();
            });
        });

        describe('prev', () => {
            it('should go to previous step', () => {
                const modalSteps = createModalSteps(['step1'], ['step2']);
                fixture.componentRef.setInput('modalSteps', modalSteps);

                component.next();
                expect(component['__currentStepGroupIdx']).toBe(1);

                component.prev();

                expect(component['__currentStepGroupIdx']).toBe(0);
                expect(component['__currentStep']).toBe(modalSteps[0][0]);
            });
        });

        describe('closeModal', () => {
            it('should call modalService.close', () => {
                component.closeModal();

                expect(modalService.close).toHaveBeenCalled();
            });
        });
    });

    describe('Template Rendering', () => {
        describe('Content Template', () => {
            it('should render current step template', () => {
                const modalSteps = createModalSteps(['step1']);
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const content = fixture.nativeElement.querySelector('.test-content');
                expect(content).toBeTruthy();
                expect(content.textContent.trim()).toBe('Test Content');
            });

            it('should render button templates', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [{
                        id: 'step1',
                        templateRef: templateHelper.testTemplate,
                        buttonsRef: [templateHelper.buttonTemplate, templateHelper.buttonTemplate]
                    }]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const buttons = fixture.nativeElement.querySelectorAll('.test-button');
                expect(buttons.length).toBe(2);
            });
        });

        describe('Stepper Display', () => {
            it('should display stepper when step is not ignored', () => {
                const modalSteps = createModalSteps(['step1']);
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const stepper = fixture.debugElement.query(By.directive(MockStepperComponent));
                expect(stepper).toBeTruthy();
            });

            it('should not display stepper when step is ignored', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { ignoreIdx: true })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const stepper = fixture.debugElement.query(By.directive(MockStepperComponent));
                expect(stepper).toBeFalsy();
            });
        });

        describe('Header Display', () => {
            it('should display header when headIcon or headTitle is provided', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headIcon: 'TestIcon', headTitle: 'Test Title' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const header = fixture.nativeElement.querySelector('.head');
                expect(header).toBeTruthy();
            });

            it('should display head icon when provided', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headIcon: 'TestIcon' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const icon = fixture.nativeElement.querySelector('.icon-head');
                expect(icon).toBeTruthy();
            });

            it('should display head title when provided', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headTitle: 'Test Title' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const title = fixture.nativeElement.querySelector('.head .modal-title');
                expect(title).toBeTruthy();
                expect(title.textContent.trim()).toBe('Test Title');
            });

            it('should display sub-header when subHeadTitle is provided', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { subHeadTitle: 'Sub Title' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const subHead = fixture.nativeElement.querySelector('.sub-head');
                expect(subHead).toBeTruthy();
                expect(subHead.textContent.trim()).toBe('Sub Title');
            });
        });

        describe('Back Arrow Display', () => {
            it('should display back arrow when not on first step', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headTitle: 'Step 1' })],
                    [createModalStep('step2', { headTitle: 'Step 2' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);

                component.next();
                fixture.detectChanges();

                const backArrow = fixture.nativeElement.querySelector('.icon-back');
                expect(backArrow).toBeTruthy();
            });

            it('should not display back arrow on first step', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headTitle: 'Step 1' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const backArrow = fixture.nativeElement.querySelector('.icon-back');
                expect(backArrow).toBeFalsy();
            });

            it('should call prev when back arrow is clicked', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headTitle: 'Step 1' })],
                    [createModalStep('step2', { headTitle: 'Step 2' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);

                component.next();
                fixture.detectChanges();

                spyOn(component, 'prev');
                const backArrow = fixture.nativeElement.querySelector('.icon-back');
                backArrow.click();

                expect(component.prev).toHaveBeenCalled();
            });
        });

        describe('Close Icon', () => {
            it('should display close icon', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headTitle: 'Step 1' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                const closeIcon = fixture.nativeElement.querySelector('.icon-close');
                expect(closeIcon).toBeTruthy();
            });

            it('should call closeModal when close icon is clicked', () => {
                const modalSteps: ModalStep<string>[][] = [
                    [createModalStep('step1', { headTitle: 'Step 1' })]
                ];
                fixture.componentRef.setInput('modalSteps', modalSteps);
                fixture.detectChanges();

                spyOn(component, 'closeModal');
                const closeIcon = fixture.nativeElement.querySelector('.icon-close');
                closeIcon.click();

                expect(component.closeModal).toHaveBeenCalled();
            });
        });
    });

    describe('Change Detection', () => {
        it('should call markForCheck when navigating', () => {
            const modalSteps = createModalSteps(['step1'], ['step2']);
            fixture.componentRef.setInput('modalSteps', modalSteps);

            const changeDetectorRef = component['_cd'];
            spyOn(changeDetectorRef, 'markForCheck');

            component.next();

            expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
        });
    });
});
