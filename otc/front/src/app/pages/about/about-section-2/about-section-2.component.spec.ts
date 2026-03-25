import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSection2Component } from './about-section-2.component';
import {TranslateModule} from '@ngx-translate/core';

describe('AboutSection2Component', () => {
    let component: AboutSection2Component;
    let fixture: ComponentFixture<AboutSection2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AboutSection2Component, TranslateModule.forRoot()]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AboutSection2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
