import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTradeInProgramDto, UpdateTradeInProgramDto } from './dto/trade-in-program.dto';

@Injectable()
export class TradeInProgramsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const exists = await this.prisma.tradeInProgram.findUnique({ where: { code: 'XIAOMI' } });
    if (!exists) {
      await this.prisma.tradeInProgram.create({
        data: { code: 'XIAOMI', name: 'Thu cũ Xiaomi', description: 'Chương trình thu cũ thiết bị Xiaomi', isActive: true },
      });
    }
  }

  async findAll() {
    const programs = await this.prisma.tradeInProgram.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        formTemplate: { include: { fields: { orderBy: { sortOrder: 'asc' } } } },
        inboundRequests: { select: { id: true, status: true, totalEstimatedValue: true, totalActualValue: true } },
      },
    });

    return programs.map((p) => {
      const requests = p.inboundRequests;
      // Backward compat: expose customFields từ FormField nếu có FormTemplate
      const customFields = p.formTemplate?.fields.map(f => ({
        key: f.key, label: f.label, type: f.type, required: f.isRequired, options: f.options,
      })) ?? (p.customFields as any[] ?? []);
      return {
        ...p,
        customFields,
        inboundRequests: undefined,
        stats: {
          totalRequests: requests.length,
          completedRequests: requests.filter(r => r.status === 'COMPLETED').length,
          totalEstimatedValue: requests.reduce((s, r) => s + (r.totalEstimatedValue || 0), 0),
          totalActualValue: requests.reduce((s, r) => s + (r.totalActualValue || 0), 0),
        },
      };
    });
  }

  async findOne(id: string) {
    const program = await this.prisma.tradeInProgram.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        formTemplate: { include: { fields: { orderBy: { sortOrder: 'asc' } } } },
      },
    });
    if (!program) throw new NotFoundException(`TradeInProgram ${id} not found`);

    const customFields = program.formTemplate?.fields.map(f => ({
      key: f.key, label: f.label, type: f.type, required: f.isRequired,
      visible: f.isVisible, options: f.options,
    })) ?? (program.customFields as any[] ?? []);

    return { ...program, customFields };
  }

  async create(dto: CreateTradeInProgramDto, userId?: string) {
    const existing = await this.prisma.tradeInProgram.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Program code "${dto.code}" already exists`);

    const customFields: any[] = dto.customFields ?? [];

    return this.prisma.$transaction(async (tx) => {
      // Tạo FormTemplate nếu có customFields
      let formTemplateId: string | undefined;
      if (customFields.length > 0) {
        const tmpl = await tx.formTemplate.create({
          data: {
            name: `Form - ${dto.name}`,
            fields: {
              create: customFields.map((f, i) => ({
                key: f.key,
                label: f.label,
                type: f.type ?? 'TEXT',
                isRequired: f.required ?? false,
                isVisible: true,
                sortOrder: i,
                options: f.options ?? null,
              })),
            },
          },
        });
        formTemplateId = tmpl.id;
      }

      return tx.tradeInProgram.create({
        data: {
          code: dto.code.toUpperCase().trim(),
          name: dto.name,
          description: dto.description,
          logoUrl: dto.logoUrl,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          customFields: customFields as any,
          defaultFieldConfig: dto.defaultFieldConfig as any,
          formTemplateId,
          createdById: userId,
        },
      });
    });
  }

  async update(id: string, dto: UpdateTradeInProgramDto) {
    const program = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Cập nhật FormTemplate/FormField nếu customFields thay đổi
      if (dto.customFields !== undefined) {
        const fields: any[] = dto.customFields ?? [];

        if ((program as any).formTemplateId) {
          // Xóa và tạo lại fields
          await tx.formField.deleteMany({ where: { templateId: (program as any).formTemplateId } });
          if (fields.length > 0) {
            await tx.formField.createMany({
              data: fields.map((f, i) => ({
                templateId: (program as any).formTemplateId,
                key: f.key, label: f.label,
                type: f.type ?? 'TEXT',
                isRequired: f.required ?? false,
                isVisible: true,
                sortOrder: i,
                options: f.options ?? null,
              })),
            });
          }
        } else if (fields.length > 0) {
          // Tạo FormTemplate mới
          const tmpl = await tx.formTemplate.create({
            data: {
              name: `Form - ${program.name}`,
              fields: {
                create: fields.map((f, i) => ({
                  key: f.key, label: f.label,
                  type: f.type ?? 'TEXT',
                  isRequired: f.required ?? false,
                  isVisible: true, sortOrder: i,
                  options: f.options ?? null,
                })),
              },
            },
          });
          await tx.tradeInProgram.update({ where: { id }, data: { formTemplateId: tmpl.id } });
        }
      }

      return tx.tradeInProgram.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.startDate !== undefined && { startDate: dto.startDate ? new Date(dto.startDate) : null }),
          ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
          ...(dto.customFields !== undefined && { customFields: dto.customFields as any }),
          ...(dto.defaultFieldConfig !== undefined && { defaultFieldConfig: dto.defaultFieldConfig as any }),
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tradeInProgram.update({ where: { id }, data: { isActive: false } });
  }

  // Lấy FormTemplate với fields để render form
  async getFormTemplate(programId: string) {
    const program = await this.prisma.tradeInProgram.findUnique({
      where: { id: programId },
      include: { formTemplate: { include: { fields: { orderBy: { sortOrder: 'asc' } } } } },
    });
    if (!program) throw new NotFoundException(`TradeInProgram ${programId} not found`);
    return program.formTemplate;
  }

  // Lưu form submission từ inbound item
  async saveFormSubmission(
    templateId: string,
    referenceType: string,
    referenceId: string,
    values: Record<string, any>,
  ) {
    return this.prisma.formSubmission.create({
      data: {
        templateId,
        referenceType,
        referenceId,
        values: {
          create: Object.entries(values).map(([fieldKey, value]) => ({
            fieldKey,
            value: value as any,
          })),
        },
      },
      include: { values: true },
    });
  }
}
