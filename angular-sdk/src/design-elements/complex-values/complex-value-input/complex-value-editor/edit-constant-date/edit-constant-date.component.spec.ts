import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConstantDateComponent } from './edit-constant-date.component';
import {TranslateModule} from '@ngx-translate/core';

describe('EditConstantDateComponent', () => {
    let component: EditConstantDateComponent;
    let fixture: ComponentFixture<EditConstantDateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditConstantDateComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(EditConstantDateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
