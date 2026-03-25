import { Test, TestingModule } from '@nestjs/testing';
import { SourceValidationService } from './source-validation.service';

describe('SourceValidationService', () => {
  let service: SourceValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourceValidationService],
    }).compile();

    service = module.get<SourceValidationService>(SourceValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
