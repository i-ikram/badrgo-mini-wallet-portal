import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({
    example: '2026-06-10',
    description: 'The date for the daily summary report (YYYY-MM-DD format)',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date?: string;
}
