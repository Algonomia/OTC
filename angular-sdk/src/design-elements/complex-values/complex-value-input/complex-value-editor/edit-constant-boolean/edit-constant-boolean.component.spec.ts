import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConstantBooleanComponent } from './edit-constant-boolean.component';
import {TranslateModule} from '@ngx-translate/core';

describe('EditConstantBooleanComponent', () => {
    let component: EditConstantBooleanComponent;
    let fixture: ComponentFixture<EditConstantBooleanComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditConstantBooleanComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(EditConstantBooleanComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
