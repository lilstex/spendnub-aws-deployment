import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
