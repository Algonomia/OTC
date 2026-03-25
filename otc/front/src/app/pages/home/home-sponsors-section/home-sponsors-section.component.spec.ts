import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeSponsorsSectionComponent } from './home-sponsors-section.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('HomeSponsorsSectionComponent', () => {
    let component: HomeSponsorsSectionComponent;
    let fixture: ComponentFixture<HomeSponsorsSectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeSponsorsSectionComponent, TranslateModule.forRoot(), HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeSponsorsSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
