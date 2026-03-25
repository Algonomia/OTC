import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonRateModalComponent } from './button-rate-modal.component';
import {TranslateModule} from '@ngx-translate/core';

describe('ButtonRateModalComponent', () => {
    let component: ButtonRateModalComponent;
    let fixture: ComponentFixture<ButtonRateModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonRateModalComponent, TranslateModule.forRoot()]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ButtonRateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
