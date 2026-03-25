import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiAccessComponent } from './api-access.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('ApiAccessComponent', () => {
    let component: ApiAccessComponent;
    let fixture: ComponentFixture<ApiAccessComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ApiAccessComponent, HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [DialogService]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ApiAccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
