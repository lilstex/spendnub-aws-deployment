import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string; // "Personal", "Household", etc.

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ enum: ['owner', 'viewer'], default: 'owner' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(Profile);
