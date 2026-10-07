import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RatingResult {
  id: string;
  toiletId: string;
  score: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ToiletRatingStats {
  avgRating: number | null;
  ratingCount: number;
}

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    toiletId: string,
    score: number,
    note?: string,
  ): Promise<RatingResult> {
    const toilet = await this.prisma.toilet.findUnique({
      where: { id: toiletId },
    });
    if (!toilet) throw new NotFoundException('Toilet not found');

    const rating = await this.prisma.rating.upsert({
      where: { userId_toiletId: { userId, toiletId } },
      update: {
        score,
        note: note ?? null,
      },
      create: {
        userId,
        toiletId,
        score,
        note: note ?? null,
      },
    });

    return {
      id: rating.id,
      toiletId: rating.toiletId,
      score: rating.score,
      note: rating.note,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    };
  }

  async getStats(toiletId: string): Promise<ToiletRatingStats> {
    const agg = await this.prisma.rating.aggregate({
      where: { toiletId },
      _avg: { score: true },
      _count: { id: true },
    });
    return {
      avgRating: agg._avg.score ?? null,
      ratingCount: agg._count.id,
    };
  }
}