import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitToiletDto } from './dto/submit-toilet.dto';
import { Toilet } from '@prisma/client';

export interface ToiletSearchQuery {
  isFree?: boolean;
  isWheelchairAccessible?: boolean;
  isOpen247?: boolean;
  search?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface ToiletWithStats extends Toilet {
  avgRating: number | null;
  ratingCount: number;
}

const BUDAPEST_LAT_MIN = 47.35;
const BUDAPEST_LAT_MAX = 47.62;
const BUDAPEST_LON_MIN = 18.88;
const BUDAPEST_LON_MAX = 19.38;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

@Injectable()
export class ToiletsService {
  private readonly logger = new Logger(ToiletsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(query: ToiletSearchQuery, requester?: { role: string }): Promise<ToiletWithStats[]> {
    const where: any = { status: 'APPROVED' };

    if (query.isFree) where.feeHuf = 0;
    if (query.isWheelchairAccessible) where.isWheelchairAccessible = true;
    if (query.isOpen247) where.isOpen247 = true;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { postalCode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const toilets = await this.prisma.toilet.findMany({ where });

    const resultPromises = toilets.map((t) => this.withStats(t));
    let result = await Promise.all(resultPromises);

    if (query.lat != null && query.lng != null && query.radiusKm != null) {
      result = result.filter((t) => {
        const d = haversineKm(query.lat, query.lng, t.latitude, t.longitude);
        return d <= query.radiusKm;
      });
    }

    return result;
  }

  async findById(id: string, requester?: { role: string }): Promise<ToiletWithStats> {
    const toilet = await this.prisma.toilet.findUnique({ where: { id } });
    if (!toilet) throw new NotFoundException('Toilet not found');

    if (toilet.status !== 'APPROVED' && requester?.role !== 'ADMIN') {
      throw new NotFoundException('Toilet not found');
    }

    return this.withStats(toilet);
  }

  async submit(dto: SubmitToiletDto, userId: string): Promise<Toilet> {
    const lat = Number(dto.latitude);
    const lon = Number(dto.longitude);
    if (
      lat < BUDAPEST_LAT_MIN ||
      lat > BUDAPEST_LAT_MAX ||
      lon < BUDAPEST_LON_MIN ||
      lon > BUDAPEST_LON_MAX
    ) {
      throw new ForbiddenException('Coordinates are outside Budapest bounds');
    }

    return this.prisma.toilet.create({
      data: {
        id: `BP-SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: dto.name,
        address: dto.address,
        postalCode: dto.postalCode,
        locationDetails: dto.locationDetails,
        latitude: lat,
        longitude: lon,
        isWheelchairAccessible: dto.isWheelchairAccessible ?? false,
        isOpen247: dto.isOpen247 ?? false,
        feeHuf: dto.feeHuf ?? 0,
        openingHours: dto.openingHours,
        operator: dto.operator,
        status: 'PENDING_REVIEW',
        submittedByUserId: userId,
      },
    });
  }

  private async withStats(toilet: Toilet): Promise<ToiletWithStats> {
    const agg = await this.prisma.rating.aggregate({
      where: { toiletId: toilet.id },
      _avg: { score: true },
      _count: { id: true },
    });
    return {
      ...toilet,
      avgRating: agg._avg.score ?? null,
      ratingCount: agg._count.id,
    };
  }
}