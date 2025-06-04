// create-event.dto.ts
import {
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventCategory } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ example: 'ICONIC Drop: Edição São Paulo' })
  @IsString()
  @Length(3, 120)
  title: string;

  @ApiProperty({ example: 'O evento mais aguardado da temporada ICONIC.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Rua Augusta, 1500 - São Paulo, SP' })
  @IsString()
  @Length(3, 200)
  location: string;

  @ApiProperty({ example: '2025-07-15' })
  @IsString() // Alterado para @IsString()
  date: string;

  @ApiProperty({ example: '18:30' })
  @IsString() // Alterado para @IsString()
  time: string;

  @ApiProperty({ example: 'party', enum: EventCategory })
  @IsEnum(EventCategory)
  category: EventCategory;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_exclusive: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({ example: 200 })
  @IsInt()
  max_attendees: number;

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

  @ApiProperty({
    example: 'https://storage.supabase.com/events/banner-drop123.jpg',
  })
  @IsUrl()
  cover_image_url: string;
}
