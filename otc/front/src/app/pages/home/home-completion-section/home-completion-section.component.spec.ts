import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCompletionSectionComponent } from './home-completion-section.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('HomeCompletionSectionComponent', () => {
    let component: HomeCompletionSectionComponent;
    let fixture: ComponentFixture<HomeCompletionSectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeCompletionSectionComponent, TranslateModule.forRoot(), HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeCompletionSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
