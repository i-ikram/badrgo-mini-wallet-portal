import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+1234567890', description: 'The phone number of the user' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user (must be unique)' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVE, description: 'The status of the user' })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
