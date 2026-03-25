import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JurisdictionExportComponent } from './jurisdiction-export.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('JurisdictionExportComponent', () => {
    let component: JurisdictionExportComponent<any>;
    let fixture: ComponentFixture<JurisdictionExportComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JurisdictionExportComponent, TranslateModule.forRoot(), HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(JurisdictionExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
