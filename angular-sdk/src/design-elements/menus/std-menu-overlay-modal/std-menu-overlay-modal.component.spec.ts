import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StdMenuOverlayModalComponent } from './std-menu-overlay-modal.component';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('StdMenuOverlayModalComponent', () => {
    let component: StdMenuOverlayModalComponent<any, any>;
    let fixture: ComponentFixture<StdMenuOverlayModalComponent<any, any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StdMenuOverlayModalComponent, TranslateModule.forRoot()],
            providers: [
                DialogService,
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(StdMenuOverlayModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
