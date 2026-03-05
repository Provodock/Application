import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ISO date string in the future' })
  @IsDateString()
  date!: string;

  @ApiProperty()
  @IsString()
  location!: string;

  @ApiProperty({ required: false, description: 'Leave empty for unlimited' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}

