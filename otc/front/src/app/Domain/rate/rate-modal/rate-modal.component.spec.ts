import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateModalComponent } from './rate-modal.component';
import {DialogService} from 'primeng/dynamicdialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('RateModalComponent', () => {
    let component: RateModalComponent;
    let fixture: ComponentFixture<RateModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RateModalComponent, HttpClientTestingModule],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(RateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
