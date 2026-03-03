import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateQCInspectionDto,
  UpdateInspectionResultsDto,
  CompleteInspectionDto,
  InspectionQueryDto 
} from './dto/qc-inspection.dto';
import { Grade, SerialStatus } from '@prisma/client';

@Injectable()
export class QCInspectionService {
  constructor(private prisma: PrismaService) {}

  // Create new QC inspection
  async create(createDto: CreateQCInspectionDto, inspectorId: string) {
    // Verify serial item exists and is eligible for QC
    const serialItem = await this.prisma.serialItem.findUnique({
      where: { id: createDto.serialItemId },
      include: { 
        productTemplate: { 
          include: { category: true } 
        } 
      }
    });

    if (!serialItem) {
      throw new NotFoundException('Serial item not found');
    }

    if (!['INCOMING', 'QC_IN_PROGRESS'].includes(serialItem.status)) {
      throw new BadRequestException(
        `Serial item status '${serialItem.status}' is not eligible for QC inspection`
      );
    }

    // Verify QC template exists
    const template = await this.prisma.qCTemplate.findUnique({
      where: { id: createDto.templateId },
      include: { checkItems: true }
    });

    if (!template) {
      throw new NotFoundException('QC template not found');
    }

    // Create inspection
    const inspection = await this.prisma.qCInspection.create({
      data: {
        serialItemId: createDto.serialItemId,
        templateId: createDto.templateId,
        inspectorId: inspectorId,
        status: 'PENDING',
        notes: createDto.notes,
        startedAt: new Date(),
      },
      include: {
        serialItem: {
          include: {
            productTemplate: {
              include: { category: true, brand: true }
            }
          }
        },
        template: {
          include: { checkItems: true }
        },
        inspector: {
          select: { fullName: true, email: true }
        }
      }
    });

    // Update serial item status to QC_IN_PROGRESS  
    await this.prisma.serialItem.update({
      where: { id: createDto.serialItemId },
      data: { status: 'QC_IN_PROGRESS' }
    });

    // Create transaction log
    await this.prisma.serialTransaction.create({
      data: {
        serialItemId: createDto.serialItemId,
        type: 'QC_START',
        fromStatus: serialItem.status,
        toStatus: 'QC_IN_PROGRESS', 
        notes: `QC inspection started with template: ${template.name}`,
        performedById: inspectorId,
      }
    });

    return inspection;
  }

  // Update inspection with results
  async updateResults(id: string, updateDto: UpdateInspectionResultsDto, inspectorId: string) {
    const inspection = await this.prisma.qCInspection.findUnique({
      where: { id },
      include: { 
        template: { include: { checkItems: true } },
        items: true
      }
    });

    if (!inspection) {
      throw new NotFoundException('QC inspection not found');
    }

    if (inspection.inspectorId !== inspectorId) {
      throw new BadRequestException('Only assigned inspector can update results');
    }

    if (inspection.status === 'COMPLETED') {
      throw new BadRequestException('Cannot update completed inspection');
    }

    // Validate all required check items have results
    const templateCheckIds = inspection.template.checkItems.map(item => item.id);
    const providedCheckIds = updateDto.items.map(item => item.checkItemId);
    
    const missingChecks = templateCheckIds.filter(id => !providedCheckIds.includes(id));
    if (missingChecks.length > 0) {
      throw new BadRequestException('Missing results for some check items');
    }

    // Clear existing inspection items
    await this.prisma.qCInspectionItem.deleteMany({
      where: { inspectionId: id }
    });

    // Create new inspection items
    await Promise.all(
      updateDto.items.map(item => 
        this.prisma.qCInspectionItem.create({
          data: {
            inspectionId: id,
            checkItemId: item.checkItemId,
            score: item.score,
            passed: item.passed,
            notes: item.notes,
          }
        })
      )
    );

    // Update inspection with results
    const updatedInspection = await this.prisma.qCInspection.update({
      where: { id },
      data: {
        status: 'PENDING',
        totalScore: updateDto.totalScore,
        suggestedGrade: updateDto.suggestedGrade,
        finalGrade: updateDto.finalGrade || updateDto.suggestedGrade,
        notes: updateDto.notes,
      },
      include: {
        serialItem: {
          include: {
            productTemplate: {
              include: { category: true, brand: true }
            }
          }
        },
        template: {
          include: { checkItems: true }
        },
        inspector: {
          select: { fullName: true, email: true }
        },
        items: {
          include: {
            checkItem: true
          }
        }
      }
    });

    return updatedInspection;
  }

  // Complete inspection and update serial item
  async complete(id: string, completeDto: CompleteInspectionDto, inspectorId: string) {
    const inspection = await this.prisma.qCInspection.findUnique({
      where: { id },
      include: { 
        serialItem: true,
        template: true 
      }
    });

    if (!inspection) {
      throw new NotFoundException('QC inspection not found');
    }

    if (inspection.inspectorId !== inspectorId) {
      throw new BadRequestException('Only assigned inspector can complete inspection');
    }

    if (inspection.status === 'COMPLETED') {
      throw new BadRequestException('Inspection already completed');
    }

    // Update inspection as completed
    const completedInspection = await this.prisma.qCInspection.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalGrade: completeDto.finalGrade,
        notes: completeDto.notes,
        completedAt: new Date(),
      },
      include: {
        serialItem: true,
        template: true,
        inspector: {
          select: { fullName: true, email: true }
        }
      }
    });

    // Update serial item with QC results
    const newStatus = this.determineStatusFromGrade(completeDto.finalGrade);
    
    await this.prisma.serialItem.update({
      where: { id: inspection.serialItemId },
      data: {
        grade: completeDto.finalGrade,
        status: newStatus,
        conditionNotes: completeDto.notes || inspection.serialItem.conditionNotes,
      }
    });

    // Create transaction log
    await this.prisma.serialTransaction.create({
      data: {
        serialItemId: inspection.serialItemId,
        type: 'QC_COMPLETE',
        fromStatus: 'QC_IN_PROGRESS',
        toStatus: newStatus,
        notes: `QC completed with grade ${completeDto.finalGrade}. Score: ${inspection.totalScore}`,
        performedById: inspectorId,
      }
    });

    return completedInspection;
  }

  // Get all inspections with filters
  async findAll(query: InspectionQueryDto) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.inspectorId) {
      where.inspectorId = query.inspectorId;
    }

    if (query.serialItemId) {
      where.serialItemId = query.serialItemId;
    }

    if (query.startDate || query.endDate) {
      where.startedAt = {};
      if (query.startDate) {
        where.startedAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startedAt.lte = new Date(query.endDate + 'T23:59:59.999Z');
      }
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 20);

    const [inspections, total] = await Promise.all([
      this.prisma.qCInspection.findMany({
        where,
        skip,
        take: query.limit || 20,
        include: {
          serialItem: {
            select: {
              serialNumber: true,
              internalCode: true,
              status: true,
              grade: true,
              productTemplate: {
                select: { name: true, model: true }
              }
            }
          },
          template: {
            select: { name: true }
          },
          inspector: {
            select: { fullName: true, email: true }
          },
          items: {
            include: {
              checkItem: {
                select: { item: true, maxScore: true }
              }
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      }),
      this.prisma.qCInspection.count({ where })
    ]);

    return {
      data: inspections,
      meta: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pageCount: Math.ceil(total / (query.limit || 20))
      }
    };
  }

  // Get single inspection details
  async findOne(id: string) {
    const inspection = await this.prisma.qCInspection.findUnique({
      where: { id },
      include: {
        serialItem: {
          include: {
            productTemplate: {
              include: { category: true, brand: true }
            }
          }
        },
        template: {
          include: { checkItems: true }
        },
        inspector: {
          select: { fullName: true, email: true, role: true }
        },
        items: {
          include: {
            checkItem: true
          }
        }
      }
    });

    if (!inspection) {
      throw new NotFoundException('QC inspection not found');
    }

    return inspection;
  }

  // Calculate grade based on total score
  calculateGradeFromScore(score: number): Grade {
    if (score >= 98) return 'GRADE_A_NEW';
    if (score >= 95) return 'GRADE_A';
    if (score >= 90) return 'GRADE_B_PLUS';
    if (score >= 85) return 'GRADE_B';
    if (score >= 80) return 'GRADE_C_PLUS';
    if (score >= 70) return 'GRADE_C';
    return 'GRADE_D';
  }

  // Determine next status based on grade
  private determineStatusFromGrade(grade: Grade): SerialStatus {
    if (['GRADE_D'].includes(grade)) {
      return 'REFURBISHING'; // Needs repair
    }
    if (['GRADE_C', 'GRADE_C_PLUS'].includes(grade)) {
      return 'REFURBISHING'; // Might need repair
    }
    return 'AVAILABLE'; // Good condition, ready for sale
  }

  // Get QC templates for category
  async getTemplatesForCategory(categoryId: string) {
    return this.prisma.qCTemplate.findMany({
      where: { categoryId },
      include: {
        checkItems: {
          orderBy: { item: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Get inspection statistics
  async getStatistics(inspectorId?: string) {
    const where = inspectorId ? { inspectorId } : {};

    const [
      totalInspections,
      completedInspections,
      pendingInspections,
      averageScore,
      gradeDistribution
    ] = await Promise.all([
      this.prisma.qCInspection.count({ where }),
      this.prisma.qCInspection.count({ 
        where: { ...where, status: 'COMPLETED' } 
      }),
      this.prisma.qCInspection.count({ 
        where: { ...where, status: 'PENDING' } 
      }),
      this.prisma.qCInspection.aggregate({
        where: { ...where, status: 'COMPLETED', totalScore: { not: null } },
        _avg: { totalScore: true }
      }),
      this.prisma.qCInspection.groupBy({
        by: ['finalGrade'],
        where: { ...where, status: 'COMPLETED', finalGrade: { not: null } },
        _count: { finalGrade: true }
      })
    ]);

    return {
      totalInspections,
      completedInspections,
      pendingInspections,
      averageScore: averageScore._avg.totalScore || 0,
      gradeDistribution
    };
  }
}