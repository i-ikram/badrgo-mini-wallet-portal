import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The ID of the user owning this wallet' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: 'USD', default: 'USD', description: 'The currency code (3-letter ISO code)' })
  @IsString()
  @IsOptional()
  @Length(3, 3, { message: 'Currency code must be exactly 3 characters' })
  currency?: string;
}
