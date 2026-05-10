import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvestmentDocument = Investment & Document;

export enum InvestmentType {
  STOCK = 'stock',
  ETF = 'etf',
  CRYPTO = 'crypto',
  BOND = 'bond',
  MUTUAL_FUND = 'mutual_fund',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  platform: string;

  @Prop({ type: String, enum: InvestmentType, required: true })
  investmentType: InvestmentType;

  @Prop({ required: true, trim: true })
  instrumentName: string;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({ min: 0 })
  unitPrice: number;

  @Prop({ min: 0 })
  units: number;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ trim: true })
  notes: string;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
