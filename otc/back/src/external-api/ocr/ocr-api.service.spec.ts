import { Test, TestingModule } from '@nestjs/testing';
import { OcrApiService } from './ocr-api.service';

describe('OcrApiService', () => {
  let service: OcrApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrApiService],
    }).compile();

    service = module.get<OcrApiService>(OcrApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
