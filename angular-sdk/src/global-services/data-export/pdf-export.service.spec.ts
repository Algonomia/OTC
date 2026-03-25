import { TestBed } from '@angular/core/testing';
import { PdfExportService } from './pdf-export.service';
import { TranslateService } from '@ngx-translate/core';
import { AssetLoader } from './pdf-assets-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PdfExportService', () => {
    let service: PdfExportService;
    let translate: jasmine.SpyObj<TranslateService>;
    let assetLoader: jasmine.SpyObj<AssetLoader>;

    beforeEach(() => {
        const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
        translateSpy.instant.and.callFake((key: string) => key);
        const assetLoaderSpy = jasmine.createSpyObj('AssetLoader', ['populateAssetsObj', 'getImageAssetValue', 'getMiscAsset']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PdfExportService,
                { provide: TranslateService, useValue: translateSpy },
                { provide: AssetLoader, useValue: assetLoaderSpy }
            ]
        });

        service = TestBed.inject(PdfExportService);
        translate = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
        assetLoader = TestBed.inject(AssetLoader) as jasmine.SpyObj<AssetLoader>;
    });

    it('should generate a filename using TranslateService', () => {
        const filename = (service as any)._generateFilename();
        expect(translate.instant).toHaveBeenCalledWith('AngularSdk.GenericPdfExport.DocumentName', jasmine.any(Object));
        expect(filename).toContain('AngularSdk.GenericPdfExport.DocumentName');
    });
});
