import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Headers as NestHeaders,
  BadRequestException,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response as ExpressResponse } from 'express';
import { SubscriptionService } from '../service/subscription.service';
import { StripeService } from '../service/stripe.service';
import { PaystackService } from '../service/paystack.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { createHmac } from 'crypto';
import {
  BillingCycle,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../schema/subscription.schema';
import { UserGuard } from 'src/security/guards/auth.guard';
import { InitializeSubscriptionDto } from '../dto/subscription.dto';

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  private readonly stripeWebhookSecret: string;
  private readonly paystackSecret: string;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
    private readonly paystackService: PaystackService,
    private readonly configService: ConfigService,
  ) {
    this.stripeWebhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    this.paystackSecret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  @Post('webhook/stripe')
  @ApiOperation({
    summary: 'Stripe Webhook Listener',
    description:
      'Handles checkout.session.completed and subscription lifecycle',
  })
  async handleStripeWebhook(
    @NestHeaders('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
    @Res() response: ExpressResponse,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.verifyWebhook(
        request.rawBody,
        signature,
        this.stripeWebhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId } = session.metadata;

      await this.subscriptionService.finalizeSubscription(
        userId,
        session.id,
        SubscriptionStatus.ACTIVE,
      );
    }

    response.status(200).send({ received: true });
  }

  @Post('webhook/paystack')
  @ApiOperation({
    summary: 'Paystack Webhook Listener',
    description: 'Handles charge.success and invoice events',
  })
  async handlePaystackWebhook(
    @NestHeaders('x-paystack-signature') signature: string,
    @Req() request: Request,
    @Res() response: ExpressResponse,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Paystack signature');
    }

    const body = request.body;
    const hash = createHmac('sha512', this.paystackSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid Paystack signature');
    }

    if (body.event === 'charge.success') {
      const { metadata, reference } = body.data;

      const userId = metadata.userId as string | undefined;
      const plan = metadata.plan as
        | SubscriptionPlan.PERSONAL
        | SubscriptionPlan.FAMILY
        | undefined;

      const billingCycle = metadata.billingCycle as
        | BillingCycle.MONTHLY
        | BillingCycle.ANNUAL
        | undefined;

      if (!userId || !plan || !billingCycle) {
        console.error('Paystack webhook: missing metadata fields', {
          userId,
          plan,
          billingCycle,
          reference,
        });
        return { received: true };
      }

      await this.subscriptionService.finalizeSubscription(
        userId,
        reference,
        SubscriptionStatus.ACTIVE,
        plan,
        billingCycle,
      );
    }

    return response.status(200).send({ received: true });
  }

  @Post('admin/lock-expired')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async triggerLockForCurrentUser(@Req() req: Request) {
    const userId = (req as any).user.id;
    const status = await this.subscriptionService.getAccessStatus(userId);
    if (status.isExpired) {
      await this.subscriptionService.handleExpiredSubscription(userId);
      return { message: 'Buckets locked for expired account' };
    }
    return { message: 'Account is not expired — no action taken' };
  }

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Initialize payment for a subscription plan' })
  async initiate(@Req() req, @Body() dto: InitializeSubscriptionDto) {
    return this.subscriptionService.initiate(req.user.id, req.user.email, dto);
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Get full subscription access status' })
  async getStatus(@Req() req) {
    // Returns structured AccessStatus object — not just boolean
    return this.subscriptionService.getAccessStatus(req.user.id);
  }

  @Get('transactions')
  @UseGuards(UserGuard)
  async getTransactions(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: 'income' | 'expense',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.subscriptionService.getHistory(req.user.id, {
      page,
      limit,
      type,
      from,
      to,
    });
  }

  @Post('activate')
  @UseGuards(UserGuard)
  async activate(@Req() req: Request, @Body() body: { reference: string }) {
    return this.subscriptionService.finalizeSubscription(
      (req as any).user.id,
      body.reference,
      SubscriptionStatus.ACTIVE,
    );
  }
}
