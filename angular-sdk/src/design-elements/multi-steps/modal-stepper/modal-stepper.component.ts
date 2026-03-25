import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {StepperComponent} from '../stepper/stepper.component';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe} from '@ngx-translate/core';
import {ModalService} from '../../../global-services/modal.service';

export interface ModalStep<ModalStepId> {
    id: ModalStepId;
    templateRef: TemplateRef<any>;
    buttonsRef: TemplateRef<any>[];
    ignoreIdx?: boolean;
    headIcon?: string;
    headTitle?: string;
    subHeadTitle?: string;
    subHeadRef?: TemplateRef<any>;
}

@Component({
    selector: 'app-modal-stepper',
    imports: [
        NgTemplateOutlet,
        StepperComponent,
        AlgoIconComponent,
        TranslatePipe
    ],
    templateUrl: './modal-stepper.component.html',
    styleUrl: './modal-stepper.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalStepperComponent<ModalStepId> {
    @Input() set modalSteps(modalSteps: ModalStep<ModalStepId>[][]) {
        this.__modalSteps = modalSteps;
        this.__totalStep = modalSteps.filter(group =>
            !group.find(step => step.ignoreIdx)
        ).length;
        this.__currentStepGroupIdx = 0;
        this.__currentStep = modalSteps?.at(0)?.at(0);
    }
    @Input() canGoBack: boolean = true;

    protected __modalSteps: ModalStep<ModalStepId>[][] = [];
    protected __currentStepGroupIdx: number = 0;
    protected __totalStep: number = 0;
    protected __currentStep: ModalStep<ModalStepId> | undefined;

    constructor(private _cd: ChangeDetectorRef, private _modalService: ModalService) {}

    public getIdx() {
        return this.__currentStepGroupIdx;
    }

    public prev() {
        this._goPrev();
    }

    public next(id?: ModalStepId) {
        if (!id) {
            this._goNext();
        } else {
            this._goNextId(id);
        }
        this._cd.markForCheck();
        return;
    }

    private _goNext() {
        const nextPossibleSteps = this.__modalSteps[this.__currentStepGroupIdx + 1];

        if (nextPossibleSteps.length === 1) {
            this.__currentStep = nextPossibleSteps[0];
            this.__currentStepGroupIdx = this.__currentStepGroupIdx + 1;
        }
    }

    private _goNextId(id: ModalStepId) {
        for (let i = 0; i < this.__modalSteps.length ; ++i) {
            const modalSteps = this.__modalSteps[i];
            for (const modalStep of modalSteps) {
                if (id === modalStep.id) {
                    this.__currentStep = modalStep;
                    this.__currentStepGroupIdx = i;
                    this._cd.markForCheck();
                    return;
                }
            }
        }
        this.__currentStep = undefined;
    }

    private _goPrev() {
        const prevPossibleSteps = this.__modalSteps[this.__currentStepGroupIdx - 1];

        if (prevPossibleSteps.length === 1) {
            this.__currentStep = prevPossibleSteps[0];
            this.__currentStepGroupIdx = this.__currentStepGroupIdx - 1;
        }
    }

    public closeModal() {
        this._modalService.close();
    }
}
