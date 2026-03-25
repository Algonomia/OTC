import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalFiltersComponent } from './global-filters.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ModalService} from '@algonomia/angular-sdk';
import {DialogService} from 'primeng/dynamicdialog';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('GlobalFiltersComponent', () => {
    let component: GlobalFiltersComponent;
    let fixture: ComponentFixture<GlobalFiltersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlobalFiltersComponent, HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(GlobalFiltersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
