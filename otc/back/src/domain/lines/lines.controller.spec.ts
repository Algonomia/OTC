import { Test, TestingModule } from '@nestjs/testing';
import { LinesController } from './lines.controller';

describe('LinesController', () => {
  let controller: LinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinesController],
    }).compile();

    controller = module.get<LinesController>(LinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
