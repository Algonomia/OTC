import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSection1Component } from './about-section-1.component';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('AboutSection1Component', () => {
    let component: AboutSection1Component;
    let fixture: ComponentFixture<AboutSection1Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AboutSection1Component, TranslateModule.forRoot(), NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(AboutSection1Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
