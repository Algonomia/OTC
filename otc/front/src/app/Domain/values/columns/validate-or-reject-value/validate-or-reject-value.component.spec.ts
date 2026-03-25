import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateOrRejectValueComponent } from './validate-or-reject-value.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('ValidateOrRejectValueComponent', () => {
    let component: ValidateOrRejectValueComponent;
    let fixture: ComponentFixture<ValidateOrRejectValueComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ValidateOrRejectValueComponent, HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(ValidateOrRejectValueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
