import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardsComponent } from './dashboards.component';
import {HttpClientTestingModule, provideHttpClientTesting} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import {DialogService} from 'primeng/dynamicdialog';

describe('DashboardsComponent', () => {
    let component: DashboardsComponent;
    let fixture: ComponentFixture<DashboardsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardsComponent, HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
            providers: [provideHttpClientTesting(), DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
