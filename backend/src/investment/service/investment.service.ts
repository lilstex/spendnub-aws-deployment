import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Investment, InvestmentDocument } from '../schema/investment.schema';
import { CreateInvestmentDto } from '../dto/investment.dto';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment.name)
    private investmentModel: Model<InvestmentDocument>,
  ) {}

  async create(userId: string, dto: CreateInvestmentDto): Promise<Investment> {
    const units =
      dto.units ?? (dto.unitPrice ? dto.amount / dto.unitPrice : undefined);
    const investment = new this.investmentModel({
      userId: userId,
      platform: dto.platform,
      investmentType: dto.investmentType,
      instrumentName: dto.instrumentName,
      amount: dto.amount,
      unitPrice: dto.unitPrice,
      units,
      date: dto.date ? new Date(dto.date) : new Date(),
      notes: dto.notes,
    });
    return investment.save();
  }

  async findAllByUser(userId: string): Promise<Investment[]> {
    return this.investmentModel
      .find({ userId: userId })
      .sort({ date: -1 })
      .exec();
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.investmentModel.deleteOne({
      _id: id,
      userId: userId,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Investment not found');
    }
  }

  async getPortfolioSummary(userId: string) {
    const investments = await this.findAllByUser(userId);
    const totalDeployed = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const byType = investments.reduce(
      (acc, inv) => {
        acc[inv.investmentType] = (acc[inv.investmentType] ?? 0) + inv.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
    const byPlatform = investments.reduce(
      (acc, inv) => {
        acc[inv.platform] = (acc[inv.platform] ?? 0) + inv.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
    return { totalDeployed, byType, byPlatform, count: investments.length };
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await this.investmentModel.deleteMany({ userId: userId });
  }
}
