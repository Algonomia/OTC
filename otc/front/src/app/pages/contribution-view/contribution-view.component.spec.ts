import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributionViewComponent } from './contribution-view.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('ContributionViewComponent', () => {
    let component: ContributionViewComponent;
    let fixture: ComponentFixture<ContributionViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContributionViewComponent, TranslateModule.forRoot(), HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(ContributionViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
