import { TestBed } from '@angular/core/testing';

import { DownloadOtcFilesService } from './download-otc-files.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('DownloadOtcFilesService', () => {
    let service: DownloadOtcFilesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(DownloadOtcFilesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
