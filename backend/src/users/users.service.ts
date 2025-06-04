// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  async findOrCreate(data: {
    uid: string;
    email: string;
    full_name: string;
    profile_picture_url?: string;
    phone_number?: string;
    date_of_birth?: Date;
  }) {
    const {
      email,
      full_name,
      profile_picture_url,
      phone_number,
      date_of_birth,
    } = data;
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          full_name,
          profile_picture_url,
          phone_number,
          role: Role.user,
          nickname: email.split('@')[0],
          date_of_birth,
        },
      });
    }
    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  /**
   * Atualiza dados do usuário. Lança NotFoundException se o ID não existir.
   */
  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    if (dto.date_of_birth) {
      data.date_of_birth = new Date(dto.date_of_birth);
    }
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (err: any) {
      // Prisma P2025 = registro não encontrado
      if (err.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async removeWithPhotos(id: string) {
    const photos = await this.prisma.userPhoto.findMany({
      where: { user_id: id },
    });
    const paths = photos.map((p) => `${id}/${p.url.split('/').pop()}`);
    if (paths.length) {
      const { error } = await this.supabase.storage
        .from('user-photos')
        .remove(paths);
      if (error) throw error;
    }
    await this.prisma.userPhoto.deleteMany({ where: { user_id: id } });
    await this.prisma.eventParticipation.deleteMany({
      where: { user_id: id },
    });
    return this.prisma.user.delete({ where: { id } });
  }

  async promoteToIconic(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        role: Role.iconic,
        is_iconic: true,
        iconic_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
  }

  async promoteToScanner(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: Role.scanner },
    });
  }

  async demoteScanner(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: Role.user },
    });
  }

  /**
   * Lista usuários ICONIC válidos em ordem aleatória.
   */
  async findIconicUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        is_iconic: true,
        iconic_expires_at: { gt: new Date() },
      },
    });
    return users.sort(() => Math.random() - 0.5);
  }

  /**
   * Lista usuários com perfil público em ordem aleatória.
   */
  async findPublicUsers() {
    const users = await this.prisma.user.findMany({
      where: { show_public_profile: true },
    });
    return users.sort(() => Math.random() - 0.5);
  }

  /**
   * Retorna perfil público (com fotos) respeitando visibilidade.
   */
  async getPublicProfileWithPhotos(
    userId: string,
    requesterId: string | null = null,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, position: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.show_public_profile) {
      if (!requesterId) throw new ForbiddenException('Private profile');
      const requester = await this.prisma.user.findUnique({
        where: { id: requesterId },
      });
      if (
        !requester ||
        (!user.show_profile_to_iconics && !requester.is_iconic)
      ) {
        throw new ForbiddenException('Private profile');
      }
    }
    return {
      id: user.id,
      full_name: user.full_name,
      nickname: user.nickname,
      bio: user.bio,
      instagram: user.instagram,
      profile_picture_url: user.profile_picture_url,
      is_iconic: user.is_iconic,
      date_of_birth: user.date_of_birth,
      photos: user.photos,
    };
  }

  async updateProfilePicture(userId: string, url: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { profile_picture_url: url },
    });
  }

  async findPublicIconicUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        is_iconic: true,
        show_public_profile: true,
        OR: [
          { iconic_expires_at: null }, 
          { iconic_expires_at: { gt: new Date() } }, 
        ],
      },
      select: {
        id: true,
        full_name: true,
        nickname: true,
        profile_picture_url: true,
        is_iconic: true,
      },
    });

    // embaralha para exibição
    return users.sort(() => Math.random() - 0.5);
  }
}
