import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LegalNoticeModalComponent } from './legal-notice-modal.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LegalNoticeModalComponent', () => {
    let component: LegalNoticeModalComponent;
    let fixture: ComponentFixture<LegalNoticeModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LegalNoticeModalComponent, TranslateModule.forRoot(), HttpClientTestingModule],
        }).overrideComponent(LegalNoticeModalComponent, {
            set: {
                imports: [TranslatePipe],
                schemas: [NO_ERRORS_SCHEMA],
            },
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LegalNoticeModalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
