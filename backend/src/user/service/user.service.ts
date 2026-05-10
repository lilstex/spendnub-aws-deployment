import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SetCurrencyDto,
  SignUpDto,
  VerifyOtpDto,
} from '../dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { ExpenseService } from 'src/expense/service/expense.service';
import { InvestmentService } from 'src/investment/service/investment.service';
import { calculateExpirationDate, testCode } from 'src/util/helper';
import { EmailService } from 'src/providers/email/email.service';
import { Expense } from 'src/expense/schema/expense.schema';
import { Income } from 'src/income/schema/income.schema';
import { BudgetConfig } from 'src/budget/schema/budget.schema';
import { CategoryLedger } from 'src/insight/schema/category-ledger.schema';
import { Subscription } from 'src/subscription/schema/subscription.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    @InjectModel(BudgetConfig.name)
    private budgetConfigModel: Model<BudgetConfig>,
    @InjectModel(CategoryLedger.name)
    private categoryLedgerModel: Model<CategoryLedger>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private jwtService: JwtService,
    private expenseService: ExpenseService,
    private investmentService: InvestmentService,
    private emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('Email already registered');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...signUpDto,
      password: hashedPassword,
    });

    await newUser.save();
    return { message: 'User successfully registered' };
  }

  async login(email: string, pass: string) {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user._id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return {
      token,
      user: payload,
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setCurrency(userId: string, dto: SetCurrencyDto) {
    // Check if the user has already made any expenses
    const expenses = await this.expenseService.findAllByUser(userId);

    if (expenses.length > 0) {
      throw new ConflictException(
        'Currency cannot be changed once expenses have been recorded to maintain data integrity.',
      );
    }

    // Update the user currency
    return this.userModel.findByIdAndUpdate(
      userId,
      { currency: dto },
      { new: true },
    );
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // const otp = generateOtp();
    const otp = testCode;
    const expires = calculateExpirationDate(1); // 1 hour

    await this.userModel.updateOne(
      { _id: user._id },
      { otp, otpExpiresAt: expires },
    );

    await this.emailService.sendPasswordResetCode({
      user: user.email.split('@')[0],
      email: user.email,
      code: otp,
    });

    return { message: 'OTP sent to your email' };
  }

  async verifyResetOtp(dto: VerifyOtpDto) {
    const user = await this.userModel.findOne({
      email: dto.email,
      otp: dto.otp,
      otpExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clear OTP so it can't be reused
    await this.userModel.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpiresAt: 1 } },
    );

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('User not found');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect');

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters',
      );
    }

    // Hash and save
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userModel.findByIdAndUpdate(userId, { password: hashed });

    return { message: 'Password updated successfully' };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    const uid = new Types.ObjectId(userId);

    // Delete all user data in parallel
    await Promise.all([
      this.userModel.findByIdAndDelete(userId),
      // Delete these collections by userId field:
      this.expenseModel?.deleteMany({ userId: uid }),
      this.incomeModel?.deleteMany({ userId: uid }),
      this.budgetConfigModel?.deleteMany({ userId: uid }),
      this.categoryLedgerModel?.deleteMany({ userId: uid }),
      this.subscriptionModel?.deleteMany({ userId: uid }),
      this.investmentService.deleteAllByUser(userId),
    ]);

    return { message: 'Account deleted successfully' };
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('User not found');
    return { message: 'User successfully deleted' };
  }
}
