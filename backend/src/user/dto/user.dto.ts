import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  Length,
  IsNumber,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'emmanuelmbagwu77@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password@123',
    minLength: 8,
    description: 'Minimum 8 characters',
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'emmanuelmbagwu77@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SetCurrencyDto {
  @ApiProperty({ example: 'NGN', description: 'The ISO currency code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  code: string;

  @ApiProperty({ example: '₦', description: 'The currency symbol' })
  @IsString()
  @IsNotEmpty()
  symbol: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 123456 })
  @IsNumber()
  @IsNotEmpty()
  otp: number;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'NewStrongPassword123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '65a123456789' })
  id: string;

  @ApiProperty({ example: 'emmanuelmbagwu77@gmail.com' })
  email: string;

  @ApiProperty({ example: 'user' })
  role: string;

  @ApiProperty()
  isSubscribed: boolean;

  @ApiProperty()
  trialExpiration: Date;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}
