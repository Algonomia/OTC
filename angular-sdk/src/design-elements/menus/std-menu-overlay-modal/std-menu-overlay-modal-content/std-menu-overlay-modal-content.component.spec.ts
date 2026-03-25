import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StdMenuOverlayModalContentComponent } from './std-menu-overlay-modal-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectHandler } from '../../../../handlers/select-handler/select-handler';
import { ModalService } from '../../../../global-services/modal.service';

describe('StdMenuOverlayModalContentComponent', () => {
    let component: StdMenuOverlayModalContentComponent<any, any>;
    let fixture: ComponentFixture<StdMenuOverlayModalContentComponent<any, any>>;

    const base_height = 158;
    const line_height = 46;
    const height_with_select_all = base_height + line_height;

    function createMockSelectHandler(isSingleSelection: boolean): SelectHandler<any, any> {
        return {
            isSingleSelection,
            list: [],
            getDisplayValue: () => '',
            getId: () => '',
        } as any;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StdMenuOverlayModalContentComponent, TranslateModule.forRoot()],
            providers: [DialogService]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StdMenuOverlayModalContentComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Default Values', () => {
        it('should have line_height of 46', () => {
            expect(component.line_height).toBe(line_height);
        });

        it('should have __showOnlySelected$ initialized to false', (done) => {
            component['__showOnlySelected$'].subscribe(value => {
                expect(value).toBe(false);
                done();
            });
        });

        it('should have __searchControl initialized with empty string', () => {
            expect(component['__searchControl'].value).toBe('');
        });
    });

    describe('ngOnInit - Modal Size Calculations', () => {
        it('should set modal_width from ModalService based on sizeModal', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(true));
            fixture.componentRef.setInput('sizeModal', 'small');

            component.ngOnInit();

            expect(component.modal_width).toBe(ModalService.modal_width['small']);
        });

        it('should calculate virtual_scroll_max_height with base height 158px for single selection', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(true));
            fixture.componentRef.setInput('sizeModal', 'small');
            fixture.componentRef.setInput('selectAll', false);

            component.ngOnInit();

            const expectedHeight = `calc(${ModalService.modal_max_height['small']} - ${base_height}px)`;
            expect(component.virtual_scroll_max_height).toBe(expectedHeight);
        });

        it('should add line_height to base height when multi-selection with selectAll', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(false));
            fixture.componentRef.setInput('sizeModal', 'small');
            fixture.componentRef.setInput('selectAll', true);

            component.ngOnInit();

            const expectedHeight = `calc(${ModalService.modal_max_height['small']} - ${height_with_select_all}px)`;
            expect(component.virtual_scroll_max_height).toBe(expectedHeight);
        });

        it('should not add line_height when multi-selection without selectAll', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(false));
            fixture.componentRef.setInput('sizeModal', 'small');
            fixture.componentRef.setInput('selectAll', false);

            component.ngOnInit();

            const expectedHeight = `calc(${ModalService.modal_max_height['small']} - ${base_height}px)`;
            expect(component.virtual_scroll_max_height).toBe(expectedHeight);
        });

        it('should not add line_height when single selection even with selectAll true', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(true));
            fixture.componentRef.setInput('sizeModal', 'small');
            fixture.componentRef.setInput('selectAll', true);

            component.ngOnInit();

            const expectedHeight = `calc(${ModalService.modal_max_height['small']} - ${base_height}px)`;
            expect(component.virtual_scroll_max_height).toBe(expectedHeight);
        });

        it('should create __filteredList$ observable', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(true));
            fixture.componentRef.setInput('sizeModal', 'small');
            fixture.componentRef.setInput('sorted', true);

            component.ngOnInit();

            expect(component['__filteredList$']).toBeDefined();
        });

        it('should call markForCheck', () => {
            fixture.componentRef.setInput('selectHandler', createMockSelectHandler(true));
            fixture.componentRef.setInput('sizeModal', 'small');
            const cdSpy = spyOn(component['_cd'], 'markForCheck');

            component.ngOnInit();

            expect(cdSpy).toHaveBeenCalled();
        });
    });

    describe('eraseSearchControl method', () => {
        it('should reset search control to empty string', () => {
            component['__searchControl'].setValue('search text');

            component.eraseSearchControl();

            expect(component['__searchControl'].value).toBe('');
        });

        it('should reset to empty string when already empty', () => {
            component['__searchControl'].setValue('');

            component.eraseSearchControl();

            expect(component['__searchControl'].value).toBe('');
        });

        it('should reset to empty string from any value', () => {
            component['__searchControl'].setValue('long search query with special chars @#$');

            component.eraseSearchControl();

            expect(component['__searchControl'].value).toBe('');
        });
    });
});
