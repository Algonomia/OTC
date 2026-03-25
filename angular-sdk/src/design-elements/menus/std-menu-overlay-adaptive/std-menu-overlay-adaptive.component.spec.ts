import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StdMenuOverlayAdaptiveComponent } from './std-menu-overlay-adaptive.component';
import {DialogService} from 'primeng/dynamicdialog';
import {TranslateModule} from '@ngx-translate/core';

describe('StdMenuOverlayAdaptiveComponent', () => {
    let component: StdMenuOverlayAdaptiveComponent<any, any>;
    let fixture: ComponentFixture<StdMenuOverlayAdaptiveComponent<any, any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StdMenuOverlayAdaptiveComponent, TranslateModule.forRoot()],
            providers: [
                DialogService,
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StdMenuOverlayAdaptiveComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
