import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateOrRejectSourceComponent } from './validate-or-reject-source.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('ValidateOrRejectSourceComponent', () => {
    let component: ValidateOrRejectSourceComponent;
    let fixture: ComponentFixture<ValidateOrRejectSourceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ValidateOrRejectSourceComponent, HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(ValidateOrRejectSourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
