import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelectorComponent } from './date-selector.component';
import {TranslateModule} from '@ngx-translate/core';

describe('DateSelectorComponent', () => {
    let component: DateSelectorComponent;
    let fixture: ComponentFixture<DateSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DateSelectorComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DateSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
