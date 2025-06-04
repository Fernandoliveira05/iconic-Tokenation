import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  @ApiOperation({ summary: 'Create a new event (admin only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('public')
  @ApiOperation({ summary: 'List all public events' })
  @ApiResponse({ status: 200, description: 'List of public events' })
  findPublic() {
    return this.eventsService.findAllPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  @ApiOperation({ summary: 'List all exclusive events (requires login)' })
  @ApiResponse({ status: 200, description: 'List of exclusive events' })
  findPrivate() {
    return this.eventsService.findAllExclusive();
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  @ApiOperation({
    summary: 'List recommended events (with participation flag)',
  })
  @ApiResponse({ status: 200, description: 'Recommended events for user' })
  findRecommended(@Req() req) {
    return this.eventsService.findRecommendedWithParticipation(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('participating')
  @ApiOperation({ summary: 'List all events the user is participating in' })
  @ApiResponse({ status: 200, description: 'List of participating events' })
  findParticipating(@Req() req) {
    return this.eventsService.findParticipating(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Find event by ID (with participation flag)' })
  @ApiResponse({ status: 200, description: 'Event data + participation_id' })
  findById(@Param('id') id: string, @Req() req) {
    return this.eventsService.findByIdWithParticipation(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update event data (admin only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete event (admin only)' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
