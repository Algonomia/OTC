import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalQuitConfirmComponent } from './modal-quit-confirm.component';
import { ModalService } from '../../../global-services/modal.service';
import {TranslateModule} from '@ngx-translate/core';

describe('ModalQuitConfirmComponent', () => {
    let component: ModalQuitConfirmComponent;
    let fixture: ComponentFixture<ModalQuitConfirmComponent>;
    let modalServiceSpy: jasmine.SpyObj<ModalService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('ModalService', ['closeWithResult']);

        await TestBed.configureTestingModule({
            imports: [ModalQuitConfirmComponent, TranslateModule.forRoot()],
            providers: [
                { provide: ModalService, useValue: spy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ModalQuitConfirmComponent);
        component = fixture.componentInstance;
        modalServiceSpy = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call closeWithResult(true) when closeModal is called', () => {
        component.closeModal();
        expect(modalServiceSpy.closeWithResult).toHaveBeenCalledWith(true);
    });
});
