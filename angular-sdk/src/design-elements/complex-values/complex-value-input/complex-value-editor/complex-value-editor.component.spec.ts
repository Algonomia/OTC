import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexValueEditorComponent } from './complex-value-editor.component';
import {TranslateModule} from '@ngx-translate/core';

describe('ComplexValueEditorComponent', () => {
    let component: ComplexValueEditorComponent;
    let fixture: ComponentFixture<ComplexValueEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ComplexValueEditorComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ComplexValueEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
