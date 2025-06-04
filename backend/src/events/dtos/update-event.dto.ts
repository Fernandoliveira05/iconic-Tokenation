// update-event.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
  IsUrl,
  Length,
} from 'class-validator';
import { EventCategory } from '@prisma/client';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ example: 'ICONIC Drop: Edição São Paulo' })
  @IsOptional()
  @IsString()
  @Length(3, 120)
  title?: string;

  @ApiPropertyOptional({
    example: 'O evento mais aguardado da temporada ICONIC.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Rua Augusta, 1500 - São Paulo, SP' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '2025-07-15' }) // <--- STRING!
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: '18:30' }) // <--- STRING!
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional({ example: 'party', enum: EventCategory })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_exclusive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  max_attendees?: number;

  @ApiPropertyOptional({ example: 'Supreme' })
  @IsOptional()
  @IsString()
  partner_name?: string;

  @ApiPropertyOptional({
    example: 'https://storage.supabase.com/logos/supreme.png',
  })
  @IsOptional()
  @IsUrl()
  partner_logo_url?: string;

  @ApiPropertyOptional({
    example: 'https://storage.supabase.com/events/event123.png',
  })
  @IsOptional()
  @IsUrl()
  cover_image_url?: string;
}
