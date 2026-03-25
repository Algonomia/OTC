import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateKeyModalComponent } from './generate-key-modal.component';
import {TranslateModule} from '@ngx-translate/core';
import {DialogService} from 'primeng/dynamicdialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('GenerateKeyModalComponent', () => {
    let component: GenerateKeyModalComponent;
    let fixture: ComponentFixture<GenerateKeyModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GenerateKeyModalComponent, TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [DialogService]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GenerateKeyModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
