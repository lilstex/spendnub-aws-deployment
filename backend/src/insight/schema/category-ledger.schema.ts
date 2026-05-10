import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CategoryLedger extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  transactionId: string;

  @Prop({ required: true })
  categoryName: string;

  @Prop({ default: 0 })
  rollingBalance: number;

  @Prop({ default: 0 })
  totalReceived: number;

  @Prop({ default: 0 })
  currentMonthSpent: number;
}

export const CategoryLedgerSchema =
  SchemaFactory.createForClass(CategoryLedger);

CategoryLedgerSchema.index({ userId: 1, categoryName: 1 }, { unique: true });
