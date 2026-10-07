import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReportResult {
  id: string;
  toiletId: string;
  reportType: string;
  description: string;
  suggestedValue: string | null;
  status: string;
  createdAt: string;
}

const VALID_REPORT_TYPES = new Set([
  'WRONG_LOCATION',
  'WRONG_NAME_OR_ADDRESS',
  'PERMANENTLY_CLOSED',
  'OUT_OF_ORDER',
  'SCHEDULE_CHANGED',
  'FEE_CHANGED',
  'ACCESSIBILITY_INCORRECT',
  'OTHER',
]);

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    toiletId: string,
    data: { reportType: string; description: string; suggestedValue?: string },
  ): Promise<ReportResult> {
    if (!VALID_REPORT_TYPES.has(data.reportType)) {
      throw new Error(`Invalid reportType: ${data.reportType}`);
    }
    const toilet = await this.prisma.toilet.findUnique({
      where: { id: toiletId },
    });
    if (!toilet) throw new NotFoundException('Toilet not found');

    const report = await this.prisma.inconsistencyReport.create({
      data: {
        userId,
        toiletId,
        reportType: data.reportType,
        description: data.description,
        suggestedValue: data.suggestedValue ?? null,
        status: 'PENDING',
      },
    });

    return this.toResult(report);
  }

  async listPending(): Promise<ReportResult[]> {
    const reports = await this.prisma.inconsistencyReport.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    return reports.map((r) => this.toResult(r));
  }

  private toResult(r: {
    id: string;
    toiletId: string;
    reportType: string;
    description: string;
    suggestedValue: string | null;
    status: string;
    createdAt: Date;
  }): ReportResult {
    return {
      id: r.id,
      toiletId: r.toiletId,
      reportType: r.reportType,
      description: r.description,
      suggestedValue: r.suggestedValue,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  }
}