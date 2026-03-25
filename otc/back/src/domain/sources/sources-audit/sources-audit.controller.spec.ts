import { Test, TestingModule } from '@nestjs/testing';
import { SourcesAuditController } from './sources-audit.controller';

describe('SourcesAuditController', () => {
  let controller: SourcesAuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourcesAuditController],
    }).compile();

    controller = module.get<SourcesAuditController>(SourcesAuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
