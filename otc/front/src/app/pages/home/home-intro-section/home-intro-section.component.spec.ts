import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeIntroSectionComponent } from './home-intro-section.component';
import {DialogService} from 'primeng/dynamicdialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('HomeIntroSectionComponent', () => {
    let component: HomeIntroSectionComponent;
    let fixture: ComponentFixture<HomeIntroSectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeIntroSectionComponent, HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeIntroSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
