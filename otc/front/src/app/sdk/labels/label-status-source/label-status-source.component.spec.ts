import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelStatusSourceComponent } from './label-status-source.component';
import { LabelComponent } from '../../label.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SourceStatusExt } from '@otc/domain';

describe('LabelStatusSourceComponent', () => {
    let component: LabelStatusSourceComponent;
    let fixture: ComponentFixture<LabelStatusSourceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LabelStatusSourceComponent,
                LabelComponent,
                TranslateModule.forRoot()
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LabelStatusSourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct default configuration', () => {
        expect(component.color_theme).toBe('main-3-outline');
        expect(component.height).toBe(30);
        expect(component.border_theme).toBe('border-1');
        expect(component.weight).toBe('Regular');
        expect(component.text).toBe('');
        expect(component.icon).toBe('');
    });

    it('should update properties when valueStatusId is set to fully_processed', () => {
        component.valueStatusId = SourceStatusExt.fully_processed;

        expect(component.icon).toBe('assets/images/status/validated@1x.svg');
        expect(component.color_theme).toBe('ok-3-outline');
        expect(component.text).toBe('ObligationDueDateDomain.SourceStatus.FullyProcessed.text');
    });

    it('should update properties when valueStatusId is set to rejected_url', () => {
        component.valueStatusId = SourceStatusExt.rejected_url;

        expect(component.icon).toBe('assets/images/status/rejected@1x.svg');
        expect(component.color_theme).toBe('ko-3-outline');
        expect(component.text).toBe('ObligationDueDateDomain.SourceStatus.RejectedUrl.text');
    });

    it('should update properties when valueStatusId is set to wait_for_validation', () => {
        component.valueStatusId = SourceStatusExt.wait_for_validation;

        expect(component.icon).toBe('assets/images/status/waiting for validation@1x.svg');
        expect(component.color_theme).toBe('main-3-outline');
        expect(component.text).toBe('ObligationDueDateDomain.SourceStatus.WaitForValidation.text');
    });

    it('should update properties when valueStatusId is set to scan_for_malware', () => {
        component.valueStatusId = SourceStatusExt.scan_for_malware;

        expect(component.icon).toBe('assets/images/status/scanning for malware@1x.svg');
        expect(component.color_theme).toBe('orange-3-outline');
        expect(component.text).toBe('ObligationDueDateDomain.SourceStatus.ScanForMalware.text');
    });

    it('should render LabelComponent with correct properties', () => {
        const labelElement = fixture.debugElement.query(By.directive(LabelComponent));
        const labelComponent = labelElement.componentInstance;

        expect(labelComponent.color_theme).toBe('main-3-outline');
        expect(labelComponent.border_theme).toBe('border-1');
        expect(labelComponent.height).toBe(30);
        expect(labelComponent.all_icon_display_on_hover).toBe(false);
    });

    it('should update color_theme when valueStatusId changes', () => {
        expect(component.color_theme).toBe('main-3-outline');
        component.valueStatusId = SourceStatusExt.fully_processed;
        expect(component.color_theme).toBe('ok-3-outline');
    });
});
