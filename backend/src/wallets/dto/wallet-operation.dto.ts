import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class WalletOperationDto {
  @ApiProperty({
    example: 1000,
    description: 'The amount in minor units (e.g. 1000 = 10.00)',
  })
  @IsInt()
  @Min(1, { message: 'Amount must be greater than zero' })
  amount: number;

  @ApiProperty({
    example: 'ref-tx-100293',
    description: 'Unique reference ID for idempotency check',
  })
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @ApiPropertyOptional({
    example: 'Payment for ride #4829',
    description: 'Optional description of the transaction',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
