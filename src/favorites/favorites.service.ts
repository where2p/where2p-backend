import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Favorite {
  id: string;
  toiletId: string;
  createdAt: string;
  toilet: {
    id: string;
    name: string;
    address: string;
    feeHuf: number;
    isWheelchairAccessible: boolean;
    isOpen247: boolean;
  };
}

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<Favorite[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { toilet: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => ({
      id: f.id,
      toiletId: f.toiletId,
      createdAt: f.createdAt.toISOString(),
      toilet: {
        id: f.toilet.id,
        name: f.toilet.name,
        address: f.toilet.address,
        feeHuf: f.toilet.feeHuf,
        isWheelchairAccessible: f.toilet.isWheelchairAccessible,
        isOpen247: f.toilet.isOpen247,
      },
    }));
  }

  async add(userId: string, toiletId: string): Promise<Favorite> {
    const toilet = await this.prisma.toilet.findUnique({
      where: { id: toiletId },
    });
    if (!toilet) throw new NotFoundException('Toilet not found');

    const favorite = await this.prisma.favorite.upsert({
      where: { userId_toiletId: { userId, toiletId } },
      update: {},
      create: { userId, toiletId },
      include: { toilet: true },
    });

    return {
      id: favorite.id,
      toiletId: favorite.toiletId,
      createdAt: favorite.createdAt.toISOString(),
      toilet: {
        id: favorite.toilet.id,
        name: favorite.toilet.name,
        address: favorite.toilet.address,
        feeHuf: favorite.toilet.feeHuf,
        isWheelchairAccessible: favorite.toilet.isWheelchairAccessible,
        isOpen247: favorite.toilet.isOpen247,
      },
    };
  }

  async remove(userId: string, toiletId: string): Promise<{ removed: boolean }> {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_toiletId: { userId, toiletId } },
    });
    if (!existing) throw new NotFoundException('Favorite not found');
    await this.prisma.favorite.delete({
      where: { userId_toiletId: { userId, toiletId } },
    });
    return { removed: true };
  }
}