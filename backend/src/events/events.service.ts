import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // Criar novo evento
  async create(dto: CreateEventDto) {
    let dt: Date;

    // Verifica se a data já inclui hora (formato ISO)
    if (dto.date.includes('T')) {
      dt = new Date(dto.date); // Se data já inclui hora, usa diretamente
    } else {
      // Caso contrário, combina a data com o horário fornecido
      if (!dto.time) {
        throw new BadRequestException(
          '`time` is required when `date` is not a full ISO string',
        );
      }

      const [h, m] = dto.time.split(':').map(Number);
      dt = new Date(dto.date); // Usa apenas a data
      dt.setHours(h, m, 0, 0); // Ajusta hora e minuto conforme `time`

      // Verifica se a data gerada é válida
      if (isNaN(dt.getTime())) {
        throw new BadRequestException(
          `Invalid date/time: ${dto.date} / ${dto.time}`,
        );
      }
    }

    // Cria o evento no banco de dados
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        date: dt, // Salva a data completa
        time: dt, // Salva a hora combinada
        category: dto.category,
        is_exclusive: dto.is_exclusive,
        is_public: dto.is_public,
        max_attendees: dto.max_attendees,
        current_attendees: 0,
        partner_name: dto.partner_name,
        partner_logo_url: dto.partner_logo_url,
        cover_image_url: dto.cover_image_url,
      },
    });
  }

  // Encontrar eventos públicos
  async findAllPublic() {
    return this.prisma.event.findMany({ where: { is_public: true } });
  }

  // Encontrar eventos exclusivos
  async findAllExclusive() {
    return this.prisma.event.findMany({ where: { is_exclusive: true } });
  }

  // Encontrar evento por ID
  async findById(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  // Atualizar evento existente
  async update(id: string, dto: UpdateEventDto) {
    const data: any = { ...dto };

    // Se data e hora estiverem presentes, combina elas
    if (dto.date && dto.time) {
      const [h, m] = dto.time.split(':').map(Number);
      const dt = new Date(dto.date); // Data do evento
      dt.setHours(h, m, 0, 0); // Ajusta hora e minutos
      if (isNaN(dt.getTime())) {
        throw new BadRequestException(
          `Invalid date/time: ${dto.date} / ${dto.time}`,
        );
      }
      data.date = dt;
      data.time = dt; // Atualiza também o campo `time` com a data ajustada
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  // Remover evento
  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }

  // Encontrar evento com participação
  async findByIdWithParticipation(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const part = await this.prisma.eventParticipation.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
        status: 'confirmed',
      },
      select: { id: true },
    });

    return {
      ...event,
      is_participating: Boolean(part),
      participation_id: part?.id,
    };
  }

  // Encontrar eventos recomendados para o usuário
  async findRecommendedForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Iconic vê tudo, usuários normais só veem eventos públicos
    const where = user.is_iconic ? {} : { is_public: true };
    return this.prisma.event.findMany({ where });
  }

  // Encontrar eventos recomendados com participação
  async findRecommendedWithParticipation(userId: string) {
    const events = await this.findRecommendedForUser(userId);

    const parts = await this.prisma.eventParticipation.findMany({
      where: {
        user_id: userId,
        status: 'confirmed',
        event_id: { in: events.map((e) => e.id) },
      },
      select: { event_id: true, id: true },
    });

    const map = new Map(parts.map((p) => [p.event_id, p.id]));

    return events.map((e) => ({
      ...e,
      is_participating: map.has(e.id),
      participation_id: map.get(e.id),
    }));
  }

  // Encontrar eventos em que o usuário está participando
  async findParticipating(userId: string) {
    const participations = await this.prisma.eventParticipation.findMany({
      where: { user_id: userId, status: 'confirmed' },
      select: { event_id: true, id: true },
    });

    const eventIds = participations.map((p) => p.event_id);
    const events = await this.prisma.event.findMany({
      where: { id: { in: eventIds } },
    });

    return events.map((e) => ({
      ...e,
      is_participating: true,
      participation_id: participations.find((p) => p.event_id === e.id)?.id,
    }));
  }
}
