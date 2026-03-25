import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CguModalComponent } from './cgu-modal.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CguModalComponent', () => {
    let component: CguModalComponent;
    let fixture: ComponentFixture<CguModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CguModalComponent, TranslateModule.forRoot(), HttpClientTestingModule],
        }).overrideComponent(CguModalComponent, {
            set: {
                imports: [TranslatePipe],
                schemas: [NO_ERRORS_SCHEMA],
            },
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CguModalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
