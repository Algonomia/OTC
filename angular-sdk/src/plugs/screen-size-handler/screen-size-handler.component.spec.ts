import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ScreenSizeHandlerComponent } from './screen-size-handler.component';
import { ScreenSize, WidthHeightListenerService } from '../../global-services/width-height-listener.service';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    template: `
        <app-screen-size-handler
            [appSmallTemplate]="smallTpl"
            [appIntermediaryTemplate]="interTpl"
            [appNormalTemplate]="normalTpl"
        ></app-screen-size-handler>

        <ng-template #smallTpl>SMALL</ng-template>
        <ng-template #interTpl>INTERMEDIARY</ng-template>
        <ng-template #normalTpl>NORMAL</ng-template>
    `,
    standalone: true,
    imports: [ScreenSizeHandlerComponent, CommonModule]
})
class TestHostComponent {
    @ViewChild(ScreenSizeHandlerComponent) comp!: ScreenSizeHandlerComponent;
}

describe('ScreenSizeHandlerComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let component: ScreenSizeHandlerComponent;
    let screenSubject: Subject<ScreenSize>;

    beforeEach(async () => {
        screenSubject = new Subject<ScreenSize>();

        spyOnProperty(WidthHeightListenerService, 'windowScreenListener', 'get').and.returnValue(screenSubject.asObservable());

        await TestBed.configureTestingModule({
            imports: [TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        component = host.comp;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input', () => {
        it('should receive appSmallTemplate', () => {
            expect(component.appSmallTemplate).toBeTruthy();
        });

        it('should receive appIntermediaryTemplate', () => {
            expect(component.appIntermediaryTemplate).toBeTruthy();
        });

        it('should receive appNormalTemplate', () => {
            expect(component.appNormalTemplate).toBeTruthy();
        });
    });

    describe('Update screenSize', () => {
        it('should update screenSize to small when service emits small', () => {
            screenSubject.next(ScreenSize.small);
            expect(component.screenSize).toBe(ScreenSize.small);
        });

        it('should update screenSize to intermediary when service emits intermediary', () => {
            screenSubject.next(ScreenSize.intermediary);
            expect(component.screenSize).toBe(ScreenSize.intermediary);
        });

        it('should update screenSize to normal when service emits normal', () => {
            screenSubject.next(ScreenSize.normal);
            expect(component.screenSize).toBe(ScreenSize.normal);
        });
    });

    it('should call markForCheck when screenSize changes', () => {
        const spy = spyOn(component['_cdr'], 'markForCheck');
        screenSubject.next(ScreenSize.small);
        expect(spy).toHaveBeenCalled();
    });
});
