import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSectionFooterComponent } from './about-section-footer.component';
import {ModalService} from '@algonomia/angular-sdk';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('AboutSectionFooterComponent', () => {
    let component: AboutSectionFooterComponent;
    let fixture: ComponentFixture<AboutSectionFooterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AboutSectionFooterComponent,
                TranslateModule.forRoot()
            ],
            providers: [
                ModalService,
                DialogService,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AboutSectionFooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
