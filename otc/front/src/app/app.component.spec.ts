import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {TranslateModule} from '@ngx-translate/core';
import {DialogService} from 'primeng/dynamicdialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent, TranslateModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
            providers: [DialogService]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
