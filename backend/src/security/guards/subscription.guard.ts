import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SubscriptionService } from 'src/subscription/service/subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    return await this.subscriptionService.checkAccess(userId);
  }
}

// @UseGuards(UserGuard, SubscriptionGuard)
