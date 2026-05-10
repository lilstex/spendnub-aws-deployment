import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BudgetConfig } from '../schema/budget.schema';
import { CreateBudgetDto } from '../dto/budget.dto';
import { SubscriptionService } from 'src/subscription/service/subscription.service';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(BudgetConfig.name) private budgetModel: Model<BudgetConfig>,
    private subscriptionService: SubscriptionService,
  ) {}

  async getBudget(userId: string) {
    const budget = await this.budgetModel.findOne({ userId });
    if (!budget)
      return { categories: [], lockedCount: 0, upgradeRequired: false };

    const lockedCount = budget.categories.filter((c: any) => c.isLocked).length;
    const upgradeRequired = lockedCount > 0;

    // Always return all categories — frontend reads isLocked flag per category
    return {
      ...budget.toObject(),
      lockedCount,
      upgradeRequired,
    };
  }

  async configureBudget(userId: string, categories: any[]) {
    const limit = await this.subscriptionService.getBucketLimit(userId);

    // Count only the unlocked categories being submitted
    const activeCategories = categories.filter((c) => !c.isLocked);
    if (activeCategories.length > limit) {
      throw new ForbiddenException(
        `Your current plan allows a maximum of ${limit} budget buckets. ` +
          `Upgrade to Personal (₦1,500/mo) for unlimited buckets.`,
      );
    }

    const total = activeCategories.reduce((sum, c) => sum + c.percentage, 0);
    if (Math.round(total) !== 100) {
      throw new BadRequestException('Category percentages must sum to 100%');
    }

    return this.budgetModel.findOneAndUpdate(
      { userId },
      { userId, categories },
      { upsert: true, new: true },
    );
  }

  async updateBudget(userId: string, dto: CreateBudgetDto) {
    const total = dto.categories.reduce((acc, cat) => acc + cat.percentage, 0);
    if (total !== 100) {
      throw new BadRequestException(
        `Total percentage must equal 100%. Current total: ${total}%`,
      );
    }
    return this.budgetModel.findOneAndUpdate(
      { userId },
      { categories: dto.categories },
      { new: true, upsert: true },
    );
  }

  async addSubCategory(userId: string, categoryId: string, subName: string) {
    const budget = await this.budgetModel.findOne({ userId });
    if (!budget) throw new NotFoundException('Budget configuration not found');
    const category = budget.categories.id(categoryId);
    if (!category) throw new NotFoundException('Category not found');
    if (category.subCategories.includes(subName)) {
      throw new ConflictException(
        `Subcategory "${subName}" already exists in ${category.name}`,
      );
    }
    category.subCategories.push(subName);
    await budget.save();
    return budget;
  }

  async deleteSubCategory(userId: string, categoryId: string, subName: string) {
    const budget = await this.budgetModel.findOne({ userId });
    if (!budget) throw new NotFoundException('Budget configuration not found');
    const category = budget.categories.id(categoryId);
    if (!category) throw new NotFoundException('Category not found');
    category.subCategories = category.subCategories.filter(
      (n) => n !== subName,
    );
    await budget.save();
    return budget;
  }

  // Called by SubscriptionService when a subscription expires
  async softLockExcessBuckets(userId: string): Promise<void> {
    const budget = await this.budgetModel.findOne({ userId });
    if (!budget) return;

    const FREE_LIMIT = 3;
    let changed = false;

    budget.categories.forEach((cat: any, index: number) => {
      const shouldBeLocked = index >= FREE_LIMIT;
      if (cat.isLocked !== shouldBeLocked) {
        cat.isLocked = shouldBeLocked;
        changed = true;
      }
    });

    if (changed) await budget.save();
  }

  // Called when a subscription is activated — unlock everything
  async unlockAllBuckets(userId: string): Promise<void> {
    const budget = await this.budgetModel.findOne({ userId });
    if (!budget) return;

    let changed = false;
    budget.categories.forEach((cat: any) => {
      if (cat.isLocked) {
        cat.isLocked = false;
        changed = true;
      }
    });

    if (changed) await budget.save();
  }
}
