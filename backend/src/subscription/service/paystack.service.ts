import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';

  async initializeTransaction(
    userId: string,
    email: string,
    amount: number,
    plan: string,
    billingCycle: string,
  ) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // kobo
        callback_url: `${process.env.FRONTEND_URL}/subscribe/callback`,
        metadata: {
          userId,
          plan,
          billingCycle,
          gateway: 'paystack',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  }

  async verifyTransaction(reference: string) {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      },
    );
    return response.data.data;
  }
}
