import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoTableOrganizationTypeComponent } from './algo-table-organization-type.component';
import {TranslateModule} from '@ngx-translate/core';

describe('AlgoTableOrganizationTypeComponent', () => {
    let component: AlgoTableOrganizationTypeComponent;
    let fixture: ComponentFixture<AlgoTableOrganizationTypeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableOrganizationTypeComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(AlgoTableOrganizationTypeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
