import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeComplexValueTypeComponent } from './change-complex-value-type.component';
import {TranslateModule} from '@ngx-translate/core';

describe('ChangeComplexValueTypeComponent', () => {
    let component: ChangeComplexValueTypeComponent;
    let fixture: ComponentFixture<ChangeComplexValueTypeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChangeComplexValueTypeComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ChangeComplexValueTypeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
