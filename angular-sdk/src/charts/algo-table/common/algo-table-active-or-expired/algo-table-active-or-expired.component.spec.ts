import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoTableActiveOrExpiredComponent } from './algo-table-active-or-expired.component';
import {TranslateModule} from '@ngx-translate/core';

describe('AlgoTableActiveOrExpiredComponent', () => {
    let component: AlgoTableActiveOrExpiredComponent;
    let fixture: ComponentFixture<AlgoTableActiveOrExpiredComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlgoTableActiveOrExpiredComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(AlgoTableActiveOrExpiredComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display label-active when isActive is true', () => {
        component.isActive = true;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const labelActive = compiled.querySelector('app-label-active');
        const labelExpired = compiled.querySelector('app-label-expired');

        expect(labelActive).toBeTruthy();
        expect(labelExpired).toBeNull();
    });

    it('should display label-expired when isActive is false', () => {
        component.isActive = false;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const labelActive = compiled.querySelector('app-label-active');
        const labelExpired = compiled.querySelector('app-label-expired');

        expect(labelActive).toBeNull();
        expect(labelExpired).toBeTruthy();
    });

    it('should switch from label-active to label-expired when isActive changes from true to false', () => {
        fixture.componentRef.setInput('isActive', true);
        fixture.detectChanges();

        let compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-label-active')).toBeTruthy();
        expect(compiled.querySelector('app-label-expired')).toBeNull();

        fixture.componentRef.setInput('isActive', false);
        fixture.detectChanges();

        compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-label-active')).toBeNull();
        expect(compiled.querySelector('app-label-expired')).toBeTruthy();
    });

    it('should switch from label-expired to label-active when isActive changes from false to true', () => {
        fixture.componentRef.setInput('isActive', false);
        fixture.detectChanges();

        let compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-label-active')).toBeNull();
        expect(compiled.querySelector('app-label-expired')).toBeTruthy();

        fixture.componentRef.setInput('isActive', true);
        fixture.detectChanges();

        compiled = fixture.nativeElement;
        expect(compiled.querySelector('app-label-active')).toBeTruthy();
        expect(compiled.querySelector('app-label-expired')).toBeNull();
    });
});
