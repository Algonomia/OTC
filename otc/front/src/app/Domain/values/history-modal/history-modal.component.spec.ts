import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryModalComponent } from './history-modal.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('HistoryModalComponent', () => {
    let component: HistoryModalComponent;
    let fixture: ComponentFixture<HistoryModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HistoryModalComponent,
                HttpClientTestingModule,
                TranslateModule.forRoot()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
