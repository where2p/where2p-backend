import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateToiletFieldsDto } from './dto/update-toilet-fields.dto';

export interface SubmissionResult {
  id: string;
  name: string;
  status: string;
  submittedByUserId: string | null;
  createdAt: string;
}

export interface ReportAdminResult {
  id: string;
  toiletId: string;
  status: string;
  adminNotes: string | null;
  resolvedAt: string | null;
}

const VALID_TOILET_STATUSES = new Set(['APPROVED', 'REJECTED', 'CLOSED', 'PENDING_REVIEW']);

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listSubmissions(): Promise<SubmissionResult[]> {
    const toilets = await this.prisma.toilet.findMany({
      where: { status: 'PENDING_REVIEW' },
      orderBy: { createdAt: 'desc' },
    });
    return toilets.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      submittedByUserId: t.submittedByUserId,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async approve(id: string): Promise<SubmissionResult> {
    const toilet = await this.prisma.toilet.findUnique({ where: { id } });
    if (!toilet) throw new NotFoundException('Toilet not found');
    if (!VALID_TOILET_STATUSES.has('APPROVED')) throw new Error('Invalid status');

    const updated = await this.prisma.toilet.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });
    return {
      id: updated.id,
      name: updated.name,
      status: updated.status,
      submittedByUserId: updated.submittedByUserId,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async reject(id: string, reason?: string): Promise<SubmissionResult> {
    const toilet = await this.prisma.toilet.findUnique({ where: { id } });
    if (!toilet) throw new NotFoundException('Toilet not found');

    const updated = await this.prisma.toilet.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason ?? null, reviewedAt: new Date() },
    });
    return {
      id: updated.id,
      name: updated.name,
      status: updated.status,
      submittedByUserId: updated.submittedByUserId,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async listReports(): Promise<ReportAdminResult[]> {
    const reports = await this.prisma.inconsistencyReport.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    return reports.map((r) => ({
      id: r.id,
      toiletId: r.toiletId,
      status: r.status,
      adminNotes: r.adminNotes,
      resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
    }));
  }

  async resolveReport(
    id: string,
    adminId: string,
    adminNotes?: string,
    toiletFields?: UpdateToiletFieldsDto,
  ): Promise<ReportAdminResult> {
    const report = await this.prisma.inconsistencyReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Report not found');

    const updateData: any = {
      status: 'RESOLVED',
      resolvedByAdminId: adminId,
      resolvedAt: new Date(),
      adminNotes: adminNotes ?? null,
    };

    if (toiletFields && Object.keys(toiletFields).length > 0) {
      updateData.toilet = {
        update: {
          ...toiletFields,
          updatedAt: new Date(),
        },
      };
    }

    const updated = await this.prisma.inconsistencyReport.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updated.id,
      toiletId: updated.toiletId,
      status: updated.status,
      adminNotes: updated.adminNotes,
      resolvedAt: updated.resolvedAt ? updated.resolvedAt.toISOString() : null,
    };
  }

  async dismissReport(
    id: string,
    adminId: string,
    notes?: string,
  ): Promise<ReportAdminResult> {
    const report = await this.prisma.inconsistencyReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.inconsistencyReport.update({
      where: { id },
      data: {
        status: 'DISMISSED',
        resolvedByAdminId: adminId,
        resolvedAt: new Date(),
        adminNotes: notes ?? null,
      },
    });

    return {
      id: updated.id,
      toiletId: updated.toiletId,
      status: updated.status,
      adminNotes: updated.adminNotes,
      resolvedAt: updated.resolvedAt ? updated.resolvedAt.toISOString() : null,
    };
  }
}