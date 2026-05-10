import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class IncomeSplit {
  @Prop()
  categoryName: string;

  @Prop()
  allocatedAmount: number;
}

@Schema({ timestamps: true })
export class Income extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({ example: 5000 })
  @Prop({ required: true })
  totalAmount: number;

  @ApiProperty({ example: 'Monthly Salary' })
  @Prop()
  description: string;

  @ApiProperty({ type: [IncomeSplit] })
  @Prop({ type: [IncomeSplit] })
  splits: IncomeSplit[];

  @Prop({ default: Date.now })
  date: Date;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
