import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexValueInputComponent } from './complex-value-input.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ModalService} from '../../../global-services/modal.service';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('ComplexValueInputComponent', () => {
    let component: ComplexValueInputComponent;
    let fixture: ComponentFixture<ComplexValueInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ComplexValueInputComponent, TranslateModule.forRoot()],
            providers: [
                DialogService,
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ComplexValueInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
