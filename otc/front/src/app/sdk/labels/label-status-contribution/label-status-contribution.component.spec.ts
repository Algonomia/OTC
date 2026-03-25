import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelStatusContributionComponent } from './label-status-contribution.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EValuesStatus } from '@otc/domain';
import {
    labelTestDefaultConfig,
    labelTestPassPropertiesToLabel
} from '../label-test.helpers.spec';

describe('LabelStatusContributionComponent', () => {
    let component: LabelStatusContributionComponent;
    let fixture: ComponentFixture<LabelStatusContributionComponent>;
    const getFixture = () => fixture;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelStatusContributionComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelStatusContributionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    labelTestDefaultConfig(getFixture, {
        color_theme: 'main-3-outline',
        height: 30,
        border_theme: 'border-1',
        weight: 'Regular',
        text: '',
        icon: ''
    });

    labelTestPassPropertiesToLabel(getFixture, {
        color_theme: 'main-3-outline',
        border_theme: 'border-1',
        height: 30,
        all_icon_display_on_hover: false
    });

    describe('valueStatusId setter', () => {
        it('should update properties when valueStatusId is set to WaitingForAdminValidation', () => {
            fixture.componentRef.setInput(
                'valueStatusId',
                EValuesStatus.WaitingForAdminValidation
            );
            fixture.detectChanges();

            expect(component.icon).toBe('assets/images/status/waiting for validation@1x.svg');
            expect(component.color_theme).toBe('main-3-outline');
            expect(component.text).toBe('ObligationDueDateDomain.ValuesStatus.WaitingForAdminValidation');
        });

        it('should update properties when valueStatusId is set to AcceptedByAdmin', () => {
            fixture.componentRef.setInput(
                'valueStatusId',
                EValuesStatus.Accepted
            );
            fixture.detectChanges();

            expect(component.icon).toBe('assets/images/status/validated@1x.svg');
            expect(component.color_theme).toBe('ok-3-outline');
            expect(component.text).toBe('ObligationDueDateDomain.ValuesStatus.AcceptedByAdmin');
        });

        it('should update properties when valueStatusId is set to Rejected', () => {
            fixture.componentRef.setInput(
                'valueStatusId',
                EValuesStatus.Rejected
            );
            fixture.detectChanges();

            expect(component.icon).toBe('assets/images/status/rejected@1x.svg');
            expect(component.color_theme).toBe('ko-3-outline');
            expect(component.text).toBe('ObligationDueDateDomain.ValuesStatus.RejectedByAdmin');
        });

        it('should update color_theme when valueStatusId changes', () => {
            expect(component.color_theme).toBe('main-3-outline');
            fixture.componentRef.setInput(
                'valueStatusId',
                EValuesStatus.Accepted
            );
            fixture.detectChanges();

            expect(component.color_theme).toBe('ok-3-outline');
        });
    });
});
