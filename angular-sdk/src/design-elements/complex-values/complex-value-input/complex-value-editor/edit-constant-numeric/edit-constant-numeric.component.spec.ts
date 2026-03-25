import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConstantNumericComponent } from './edit-constant-numeric.component';
import {TranslateModule} from '@ngx-translate/core';

describe('EditConstantNumericComponent', () => {
    let component: EditConstantNumericComponent;
    let fixture: ComponentFixture<EditConstantNumericComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditConstantNumericComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(EditConstantNumericComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
