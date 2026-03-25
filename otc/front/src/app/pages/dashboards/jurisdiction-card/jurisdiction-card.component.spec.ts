import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JurisdictionCardComponent } from './jurisdiction-card.component';
import {TranslateModule} from '@ngx-translate/core';

describe('JurisdictionCardComponent', () => {
    let component: JurisdictionCardComponent<any>;
    let fixture: ComponentFixture<JurisdictionCardComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JurisdictionCardComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(JurisdictionCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
