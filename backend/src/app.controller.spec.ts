import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return application health status', () => {
      const response = appController.getHello();

      expect(response).toHaveProperty('status', 'healthy');
      expect(response).toHaveProperty('version', '1.0.0');
      expect(response).toHaveProperty('timestamp');

      expect(typeof response.timestamp).toBe('string');
    });
  });
});
