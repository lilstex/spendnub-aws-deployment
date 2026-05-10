import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import {
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  ResetPasswordDto,
  SetCurrencyDto,
  SignUpDto,
  UserResponseDto,
  VerifyOtpDto,
} from '../dto/user.dto';
import { UserGuard } from 'src/security/guards/auth.guard';
import { Roles } from 'src/security/guards/roles.decorator';

@ApiTags('User Section')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.userService.signUp(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(@Request() req) {
    return this.userService.findById(req.user._id);
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Patch('set-currency')
  @ApiOperation({
    summary: 'Set account currency',
    description:
      'This is a one-time setup. Once an expense is recorded, the currency is locked.',
  })
  @ApiResponse({ status: 200, description: 'Currency updated successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Expenses already exist.',
  })
  async setCurrency(@Request() req, @Body() dto: SetCurrencyDto) {
    return this.userService.setCurrency(req.user.id, dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset OTP' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.userService.forgotPassword(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify the OTP sent to email' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.userService.verifyResetOtp(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Set a new password using email verification' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(UserGuard)
  async changePassword(
    @Request() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(
      (req as any).user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Delete('account')
  @UseGuards(UserGuard)
  async deleteAccount(@Request() req: Request) {
    return this.userService.deleteAccount((req as any).user.id);
  }

  @UseGuards(UserGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiParam({ name: 'id', description: 'The unique MongoID of the user' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
