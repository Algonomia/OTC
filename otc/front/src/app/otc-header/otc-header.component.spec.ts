import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OTCHeaderComponent} from './otc-header.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('OTCHeaderComponent', () => {
    let component: OTCHeaderComponent;
    let fixture: ComponentFixture<OTCHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OTCHeaderComponent, HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
            providers: [provideNoopAnimations()]
        }).compileComponents();

        fixture = TestBed.createComponent(OTCHeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
