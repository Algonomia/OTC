import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConstantPeriodComponent } from './edit-constant-period.component';
import {TranslateModule} from '@ngx-translate/core';
import {DialogService} from 'primeng/dynamicdialog';

describe('EditConstantPeriodComponent', () => {
    let component: EditConstantPeriodComponent;
    let fixture: ComponentFixture<EditConstantPeriodComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditConstantPeriodComponent, TranslateModule.forRoot()],
            providers: [
                DialogService,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EditConstantPeriodComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
