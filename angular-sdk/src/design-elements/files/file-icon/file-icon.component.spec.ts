import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileIconComponent } from './file-icon.component';
import { FileExtensions } from '@algonomia/ts-shared';

describe('FileIconComponent', () => {
    let component: FileIconComponent;
    let fixture: ComponentFixture<FileIconComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FileIconComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FileIconComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input Bindings', () => {
        it('should accept extension input', () => {
            fixture.componentRef.setInput('extension', 'pdf');
            expect(component.extension).toBe('pdf');
        });

        it('should accept size_icon input', () => {
            fixture.componentRef.setInput('size_icon', 64);
            expect(component.size_icon).toBe(64);
        });

        it('should have default size_icon of 32', () => {
            expect(component.size_icon).toBe(32);
        });
    });

    describe('ngOnInit', () => {
        it('should call FileExtensions.getIconByExtension when extension is set', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledWith('pdf');
        });

        it('should set icon from FileExtensions.getIconByExtension', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');

            component.ngOnInit();

            expect(component.icon).toBe('assets/icons/pdf.png');
        });

        it('should not call FileExtensions.getIconByExtension when extension is empty', () => {
            spyOn(FileExtensions, 'getIconByExtension');
            fixture.componentRef.setInput('extension', '');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).not.toHaveBeenCalled();
        });

        it('should not call FileExtensions.getIconByExtension when extension is undefined', () => {
            spyOn(FileExtensions, 'getIconByExtension');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).not.toHaveBeenCalled();
        });

        it('should handle different extension types', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValues(
                'assets/icons/pdf.png',
                'assets/icons/docx.png',
                'assets/icons/xlsx.png'
            );

            fixture.componentRef.setInput('extension', 'pdf');
            component.ngOnInit();
            expect(component.icon).toBe('assets/icons/pdf.png');

            fixture.componentRef.setInput('extension', 'docx');
            component.ngOnInit();
            expect(component.icon).toBe('assets/icons/docx.png');

            fixture.componentRef.setInput('extension', 'xlsx');
            component.ngOnInit();
            expect(component.icon).toBe('assets/icons/xlsx.png');
        });
    });

    describe('Template Rendering', () => {
        it('should render img element', () => {
            fixture.componentRef.setInput('extension', 'pdf');
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('img');
            expect(img).toBeTruthy();
        });

        it('should set img src from icon property', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('img');
            expect(img.getAttribute('src')).toBe('assets/icons/pdf.png');
        });

        it('should set img alt from icon property', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('img');
            expect(img.getAttribute('alt')).toBe('assets/icons/pdf.png');
        });

        it('should set img width from size_icon', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');
            fixture.componentRef.setInput('size_icon', 48);
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('img');
            expect(img.getAttribute('width')).toBe('48');
        });

        it('should set img height from size_icon', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');
            fixture.componentRef.setInput('size_icon', 48);
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('img');
            expect(img.getAttribute('height')).toBe('48');
        });

        it('should use default size of 32 when size_icon is not set', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('img');
            expect(img.getAttribute('width')).toBe('32');
            expect(img.getAttribute('height')).toBe('32');
        });
    });

    describe('Edge Cases', () => {
        it('should handle uppercase extensions', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'PDF');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledWith('PDF');
        });

        it('should handle lowercase extensions', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'pdf');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledWith('pdf');
        });

        it('should handle mixed case extensions', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', 'PdF');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledWith('PdF');
        });

        it('should handle extensions with leading dot', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/pdf.png');
            fixture.componentRef.setInput('extension', '.pdf');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledWith('.pdf');
        });

        it('should handle size_icon of 0', () => {
            fixture.componentRef.setInput('size_icon', 0);
            expect(component.size_icon).toBe(0);
        });

        it('should handle large size_icon values', () => {
            fixture.componentRef.setInput('size_icon', 256);
            expect(component.size_icon).toBe(256);
        });

        it('should handle very small size_icon values', () => {
            fixture.componentRef.setInput('size_icon', 1);
            expect(component.size_icon).toBe(1);
        });

        it('should handle unknown extensions', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/default.png');
            fixture.componentRef.setInput('extension', 'unknown');

            component.ngOnInit();

            expect(component.icon).toBe('assets/icons/default.png');
        });

        it('should handle special characters in extension', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValue('assets/icons/file.png');
            fixture.componentRef.setInput('extension', 'tar.gz');

            component.ngOnInit();

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledWith('tar.gz');
        });

        it('should handle multiple ngOnInit calls', () => {
            spyOn(FileExtensions, 'getIconByExtension').and.returnValues(
                'assets/icons/pdf.png',
                'assets/icons/docx.png'
            );

            fixture.componentRef.setInput('extension', 'pdf');
            component.ngOnInit();
            expect(component.icon).toBe('assets/icons/pdf.png');

            fixture.componentRef.setInput('extension', 'docx');
            component.ngOnInit();
            expect(component.icon).toBe('assets/icons/docx.png');

            expect(FileExtensions.getIconByExtension).toHaveBeenCalledTimes(2);
        });
    });
});
