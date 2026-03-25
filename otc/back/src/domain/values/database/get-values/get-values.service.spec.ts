import { Test, TestingModule } from '@nestjs/testing';
import { GetValuesService } from './get-values.service';

describe('GetValuesService', () => {
  let service: GetValuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetValuesService],
    }).compile();

    service = module.get<GetValuesService>(GetValuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
