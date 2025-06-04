// src/event-checkins/event-checkin.module.ts

import { Module } from '@nestjs/common';
import { EventCheckinController } from './event-checkin.controller';
import { EventCheckinService } from './event-checkin.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [EventCheckinController],
  providers: [EventCheckinService, PrismaService],
})
export class EventCheckinModule {}
