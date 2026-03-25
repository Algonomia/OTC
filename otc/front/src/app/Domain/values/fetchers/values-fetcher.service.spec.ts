import { TestBed } from '@angular/core/testing';

import { ValuesFetcherService } from './values-fetcher.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ValuesFetcherService', () => {
    let service: ValuesFetcherService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(ValuesFetcherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
