import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class BudgetCategory extends Types.Subdocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0, max: 100 })
  percentage: number;

  @Prop([String])
  subCategories: string[];

  @Prop({ default: false })
  isLocked: boolean;
}

const BudgetCategorySchema = SchemaFactory.createForClass(BudgetCategory);

@Schema({ timestamps: true })
export class BudgetConfig extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [BudgetCategorySchema], required: true })
  categories: Types.DocumentArray<BudgetCategory>;
}

export const BudgetConfigSchema = SchemaFactory.createForClass(BudgetConfig);
