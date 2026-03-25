import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributionModalComponent } from './contribution-modal.component';
import {DialogService} from 'primeng/dynamicdialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ContributionModalComponent', () => {
    let component: ContributionModalComponent;
    let fixture: ComponentFixture<ContributionModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContributionModalComponent, HttpClientTestingModule],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(ContributionModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
