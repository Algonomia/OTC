import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceModalComponent } from './source-modal.component';
import {DialogService} from 'primeng/dynamicdialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateModule} from '@ngx-translate/core';

describe('SourceModalComponent', () => {
    let component: SourceModalComponent;
    let fixture: ComponentFixture<SourceModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SourceModalComponent, HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [DialogService]
        }).compileComponents();

        fixture = TestBed.createComponent(SourceModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
