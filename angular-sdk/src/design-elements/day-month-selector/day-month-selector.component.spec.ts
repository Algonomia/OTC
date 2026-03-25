import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayMonthSelectorComponent } from './day-month-selector.component';
import {TranslateModule} from '@ngx-translate/core';
import {DialogService} from 'primeng/dynamicdialog';

describe('DayMonthSelectorComponent', () => {
    let component: DayMonthSelectorComponent;
    let fixture: ComponentFixture<DayMonthSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DayMonthSelectorComponent, TranslateModule.forRoot()],
            providers: [
                DialogService,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DayMonthSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
