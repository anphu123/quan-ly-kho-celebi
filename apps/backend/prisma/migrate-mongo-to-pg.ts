/**
 * Script migrate data từ MongoDB Atlas → PostgreSQL (Neon)
 * Chạy: npx ts-node -r tsconfig-paths/register prisma/migrate-mongo-to-pg.ts
 *
 * Thứ tự import theo FK dependency:
 * User → Warehouse → Category → Brand → BrandCategory → ProductTemplate
 * → AttributeGroup → Attribute → ProductSpec
 * → Supplier → Customer
 * → TradeInProgram → InboundRequest → InboundItem
 * → BinLocation → SerialItem → DynamicSpec
 * → QCTemplate → QCCheckItem → QCInspection → QCInspectionItem
 * → RefurbishmentJob → PartUsage
 * → SalesOrder → SalesOrderItem
 * → StockLevel → StockMovement → SerialTransaction
 */

import { MongoClient, ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({ log: ['warn', 'error'] });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI!;
const MONGO_DB = 'celebi_db';

// Valid cuid/objectId pattern
const VALID_ID = /^[a-z0-9]{20,}$/i;

// Map _id ObjectId hoặc string → string, trả null nếu invalid
function toId(val: any): string {
  if (!val) return '';
  if (val instanceof ObjectId) return val.toHexString();
  if (typeof val === 'object' && val.$oid) return val.$oid;
  return String(val);
}

// Trả null nếu ID không hợp lệ (khoảng trắng, ký tự lạ, quá ngắn)
function toSafeId(val: any): string | null {
  const id = toId(val).trim();
  if (!id || id.length < 10 || !VALID_ID.test(id)) return null;
  return id;
}

function toDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'object' && val.$date) return new Date(val.$date);
  return new Date(val);
}

function toFloat(val: any): number {
  if (val == null) return 0;
  if (typeof val === 'object' && val.$numberDouble) return parseFloat(val.$numberDouble);
  if (typeof val === 'object' && val.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
}

function toInt(val: any): number {
  if (val == null) return 0;
  if (typeof val === 'object' && val.$numberInt) return parseInt(val.$numberInt);
  if (typeof val === 'object' && val.$numberLong) return parseInt(val.$numberLong);
  return parseInt(val) || 0;
}

async function clearPg() {
  console.log('🧹 Xóa data cũ trên PostgreSQL...');
  await prisma.stockMovement.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.serialTransaction.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.qCInspectionItem.deleteMany();
  await prisma.qCInspection.deleteMany();
  await prisma.qCCheckItem.deleteMany();
  await prisma.qCTemplate.deleteMany();
  await prisma.dynamicSpec.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.partUsage.deleteMany();
  await prisma.refurbishmentJob.deleteMany();
  await prisma.inboundItem.deleteMany();
  await prisma.inboundRequest.deleteMany();
  await prisma.tradeInProgram.deleteMany();
  await prisma.serialItem.deleteMany();
  await prisma.binLocation.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.attributeGroup.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.brandCategory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Đã xóa data cũ');
}

async function main() {
  console.log('🔗 Kết nối MongoDB Atlas...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  console.log('✅ MongoDB connected\n');

  // Kiểm tra collections tồn tại
  const cols = (await db.listCollections().toArray()).map(c => c.name);
  console.log('📦 Collections tìm thấy:', cols.join(', '), '\n');

  await clearPg();

  let stats: Record<string, number> = {};

  // ─── 1. USERS ─────────────────────────────────────────────────────────────
  {
    const docs = await db.collection('users').find().toArray();
    console.log(`👤 Users: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.user.create({
          data: {
            id: toId(d._id),
            email: d.email,
            password: d.password || '$2b$10$placeholder',
            fullName: d.fullName || d.name || 'Unknown',
            role: d.role || 'CASHIER',
            isActive: d.isActive ?? true,
            lastLoginAt: toDate(d.lastLoginAt),
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ User ${d.email}: ${e.message}`);
      }
    }
    stats.users = count;
  }

  // ─── 2. WAREHOUSES ────────────────────────────────────────────────────────
  {
    const docs = await db.collection('warehouses').find().toArray();
    console.log(`🏭 Warehouses: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.warehouse.create({
          data: {
            id: toId(d._id),
            code: d.code,
            name: d.name,
            address: d.address,
            phone: d.phone,
            isActive: d.isActive ?? true,
            totalArea: d.totalArea ? toFloat(d.totalArea) : null,
            maxCapacity: d.maxCapacity ? toInt(d.maxCapacity) : null,
            managerId: d.managerId ? toId(d.managerId) : null,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ Warehouse ${d.code}: ${e.message}`);
      }
    }
    stats.warehouses = count;
  }

  // ─── 3. CATEGORIES ────────────────────────────────────────────────────────
  {
    const docs = await db.collection('categories').find().toArray();
    console.log(`📂 Categories: ${docs.length}`);
    // Import parents trước (parentId = null)
    const sorted = [...docs].sort((a, _b) => (a.parentId ? 1 : -1));
    let count = 0;
    for (const d of sorted) {
      try {
        await prisma.category.create({
          data: {
            id: toId(d._id),
            name: d.name,
            code: d.code,
            productType: d.productType || 'ELECTRONICS',
            trackingMethod: d.trackingMethod || 'SERIAL_BASED',
            description: d.description,
            parentId: d.parentId ? toId(d.parentId) : null,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ Category ${d.code}: ${e.message}`);
      }
    }
    stats.categories = count;
  }

  // ─── 4. BRANDS ────────────────────────────────────────────────────────────
  {
    const docs = await db.collection('brands').find().toArray();
    console.log(`🏷️  Brands: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.brand.create({
          data: {
            id: toId(d._id),
            name: d.name,
            code: d.code,
            logo: d.logo || d.logoUrl,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ Brand ${d.code}: ${e.message}`);
      }
    }
    stats.brands = count;
  }

  // ─── 5. BRAND CATEGORIES ──────────────────────────────────────────────────
  {
    const docs = await db.collection('brand_categories').find().toArray();
    console.log(`🔗 BrandCategories: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.brandCategory.create({
          data: {
            id: toId(d._id),
            brandId: toId(d.brandId),
            categoryId: toId(d.categoryId),
            assignedAt: toDate(d.assignedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ BrandCategory: ${e.message}`);
      }
    }
    stats.brandCategories = count;
  }

  // ─── 6. PRODUCT TEMPLATES ─────────────────────────────────────────────────
  {
    const docs = await db.collection('product_templates').find().toArray();
    console.log(`📱 ProductTemplates: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.productTemplate.create({
          data: {
            id: toId(d._id),
            sku: d.sku,
            name: d.name,
            model: d.model,
            description: d.description,
            categoryId: toId(d.categoryId),
            brandId: toId(d.brandId),
            baseWholesalePrice: d.baseWholesalePrice ? toFloat(d.baseWholesalePrice) : null,
            baseRetailPrice: d.baseRetailPrice ? toFloat(d.baseRetailPrice) : null,
            image: d.image,
            isActive: d.isActive ?? true,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ ProductTemplate ${d.sku}: ${e.message}`);
      }
    }
    stats.productTemplates = count;
  }

  // ─── 7. ATTRIBUTE GROUPS ──────────────────────────────────────────────────
  {
    const docs = await db.collection('attribute_groups').find().toArray();
    console.log(`📋 AttributeGroups: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.attributeGroup.create({
          data: {
            id: toId(d._id),
            categoryId: toId(d.categoryId),
            name: d.name,
            description: d.description,
            sortOrder: toInt(d.sortOrder),
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ AttributeGroup ${d.name}: ${e.message}`);
      }
    }
    stats.attributeGroups = count;
  }

  // ─── 8. ATTRIBUTES ────────────────────────────────────────────────────────
  {
    const docs = await db.collection('attributes').find().toArray();
    console.log(`🔧 Attributes: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.attribute.create({
          data: {
            id: toId(d._id),
            attributeGroupId: toId(d.attributeGroupId),
            key: d.key,
            name: d.name,
            type: d.type || 'TEXT',
            isRequired: d.isRequired ?? false,
            sortOrder: toInt(d.sortOrder),
            options: d.options ?? null,
            minValue: d.minValue ? toFloat(d.minValue) : null,
            maxValue: d.maxValue ? toFloat(d.maxValue) : null,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ Attribute ${d.key}: ${e.message}`);
      }
    }
    stats.attributes = count;
  }

  // ─── 9. PRODUCT SPECS ─────────────────────────────────────────────────────
  {
    const docs = await db.collection('product_specs').find().toArray();
    console.log(`📐 ProductSpecs: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.productSpec.create({
          data: {
            id: toId(d._id),
            productTemplateId: toId(d.productTemplateId),
            attributeId: toId(d.attributeId),
            value: d.value ?? '',
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ ProductSpec: ${e.message}`);
      }
    }
    stats.productSpecs = count;
  }

  // ─── 10. SUPPLIERS ────────────────────────────────────────────────────────
  {
    const docs = await db.collection('suppliers').find().toArray();
    console.log(`🏢 Suppliers: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.supplier.create({
          data: {
            id: toId(d._id),
            code: d.code,
            name: d.name,
            contactPerson: d.contactPerson,
            phone: d.phone,
            email: d.email,
            address: d.address,
            taxCode: d.taxCode,
            bankAccount: d.bankAccount,
            notes: d.notes,
            isActive: d.isActive ?? true,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ Supplier ${d.code}: ${e.message}`);
      }
    }
    stats.suppliers = count;
  }

  // ─── 11. CUSTOMERS ────────────────────────────────────────────────────────
  {
    const docs = await db.collection('customers').find().toArray();
    console.log(`👥 Customers: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.customer.create({
          data: {
            id: toId(d._id),
            code: d.code,
            fullName: d.fullName,
            phone: d.phone,
            email: d.email,
            address: d.address,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ Customer ${d.code}: ${e.message}`);
      }
    }
    stats.customers = count;
  }

  // ─── 12. TRADE-IN PROGRAMS ────────────────────────────────────────────────
  {
    const docs = await db.collection('trade_in_programs').find().toArray();
    console.log(`♻️  TradeInPrograms: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.tradeInProgram.create({
          data: {
            id: toId(d._id),
            code: d.code,
            name: d.name,
            description: d.description,
            logoUrl: d.logoUrl,
            isActive: d.isActive ?? true,
            startDate: toDate(d.startDate),
            endDate: toDate(d.endDate),
            customFields: d.customFields ?? null,
            defaultFieldConfig: d.defaultFieldConfig ?? null,
            createdById: d.createdById ? toId(d.createdById) : null,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ TradeInProgram ${d.code}: ${e.message}`);
      }
    }
    stats.tradeInPrograms = count;
  }

  // ─── 13. INBOUND REQUESTS ─────────────────────────────────────────────────
  {
    const docs = await db.collection('inbound_requests').find().toArray();
    console.log(`📥 InboundRequests: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.inboundRequest.create({
          data: {
            id: toId(d._id),
            code: d.code,
            warehouseId: toId(d.warehouseId),
            status: d.status || 'REQUESTED',
            supplierType: d.supplierType || 'INDIVIDUAL_SELLER',
            supplierName: d.supplierName || 'Unknown',
            supplierPhone: d.supplierPhone,
            supplierEmail: d.supplierEmail,
            expectedDate: toDate(d.expectedDate),
            receivedDate: toDate(d.receivedDate),
            totalEstimatedValue: d.totalEstimatedValue ? toFloat(d.totalEstimatedValue) : null,
            totalActualValue: d.totalActualValue ? toFloat(d.totalActualValue) : null,
            notes: d.notes,
            receivedById: d.receivedById ? toId(d.receivedById) : null,
            tradeInProgramId: d.tradeInProgramId ? toId(d.tradeInProgramId) : null,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ InboundRequest ${d.code}: ${e.message}`);
      }
    }
    stats.inboundRequests = count;
  }

  // ─── 14. INBOUND ITEMS ────────────────────────────────────────────────────
  {
    const docs = await db.collection('inbound_items').find().toArray();
    console.log(`📦 InboundItems: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        // Parse customData nếu là string JSON
        let customData = d.customData ?? null;
        if (typeof customData === 'string') {
          try { customData = JSON.parse(customData); } catch { customData = null; }
        }

        await prisma.inboundItem.create({
          data: {
            id: toId(d._id),
            inboundRequestId: toId(d.inboundRequestId),
            productTemplateId: d.productTemplateId ? toId(d.productTemplateId) : null,
            categoryId: toId(d.categoryId),
            brandId: d.brandId ? toId(d.brandId) : null,
            serialNumber: d.serialNumber,
            modelName: d.modelName || d.name || 'Unknown',
            condition: d.condition,
            estimatedValue: d.estimatedValue ? toFloat(d.estimatedValue) : null,
            notes: d.notes,
            sourceCustomerName: d.sourceCustomerName,
            sourceCustomerPhone: d.sourceCustomerPhone,
            sourceCustomerAddress: d.sourceCustomerAddress,
            sourceCustomerIdCard: d.sourceCustomerIdCard,
            idCardIssueDate: toDate(d.idCardIssueDate),
            idCardIssuePlace: d.idCardIssuePlace,
            bankAccount: d.bankAccount,
            bankName: d.bankName,
            contractNumber: d.contractNumber,
            purchaseDate: toDate(d.purchaseDate),
            employeeName: d.employeeName,
            otherCosts: d.otherCosts ? toFloat(d.otherCosts) : null,
            topUp: d.topUp ? toFloat(d.topUp) : null,
            repairCost: d.repairCost ? toFloat(d.repairCost) : null,
            imageUrl: d.imageUrl,
            deviceImages: d.deviceImages,
            cccdFrontUrl: d.cccdFrontUrl,
            cccdBackUrl: d.cccdBackUrl,
            customData: customData,
            isReceived: d.isReceived ?? false,
            receivedAt: toDate(d.receivedAt),
            serialItemId: null, // sẽ update sau khi SerialItems được import
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ InboundItem ${toId(d._id)}: ${e.message}`);
      }
    }
    stats.inboundItems = count;
  }

  // ─── 15. BIN LOCATIONS ────────────────────────────────────────────────────
  {
    const docs = await db.collection('bin_locations').find().toArray();
    console.log(`📍 BinLocations: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.binLocation.create({
          data: {
            id: toId(d._id),
            warehouseId: toId(d.warehouseId),
            code: d.code,
            name: d.name,
            type: d.type || 'SHELF',
            maxItems: d.maxItems ? toInt(d.maxItems) : null,
            maxWeight: d.maxWeight ? toFloat(d.maxWeight) : null,
            currentItems: toInt(d.currentItems),
            isActive: d.isActive ?? true,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ BinLocation ${d.code}: ${e.message}`);
      }
    }
    stats.binLocations = count;
  }

  // ─── 16. SERIAL ITEMS ─────────────────────────────────────────────────────
  {
    const docs = await db.collection('serial_items').find().toArray();
    console.log(`📟 SerialItems: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.serialItem.create({
          data: {
            id: toId(d._id),
            productTemplateId: toId(d.productTemplateId),
            serialNumber: d.serialNumber,
            internalCode: d.internalCode,
            source: d.source,
            purchasePrice: toFloat(d.purchasePrice),
            purchaseDate: toDate(d.purchaseDate),
            purchaseBatch: d.purchaseBatch,
            status: d.status || 'INCOMING',
            grade: d.grade ?? null,
            conditionNotes: d.conditionNotes,
            currentCostPrice: toFloat(d.currentCostPrice),
            suggestedPrice: toFloat(d.suggestedPrice),
            warehouseId: toId(d.warehouseId),
            binLocationId: null, // binLocation là string cũ, không thể map FK
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ SerialItem ${d.internalCode}: ${e.message}`);
      }
    }
    stats.serialItems = count;
  }

  // ─── 17. QC TEMPLATES ─────────────────────────────────────────────────────
  {
    const docs = await db.collection('qc_templates').find().toArray();
    console.log(`✅ QCTemplates: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.qCTemplate.create({
          data: {
            id: toId(d._id),
            categoryId: toId(d.categoryId),
            name: d.name,
            description: d.description,
            version: d.version || '1.0',
            isActive: d.isActive ?? true,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ QCTemplate ${d.name}: ${e.message}`);
      }
    }
    stats.qcTemplates = count;
  }

  // ─── 18. QC CHECK ITEMS ───────────────────────────────────────────────────
  {
    const docs = await db.collection('qc_check_items').find().toArray();
    console.log(`🔍 QCCheckItems: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.qCCheckItem.create({
          data: {
            id: toId(d._id),
            templateId: toId(d.templateId),
            section: d.section,
            item: d.item,
            type: d.type || 'VISUAL_CHECK',
            description: d.description,
            isRequired: d.isRequired ?? false,
            sortOrder: toInt(d.sortOrder),
            maxScore: toInt(d.maxScore) || 100,
            gradingImpact: toFloat(d.gradingImpact) || 1.0,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ QCCheckItem: ${e.message}`);
      }
    }
    stats.qcCheckItems = count;
  }

  // ─── 19. QC INSPECTIONS ───────────────────────────────────────────────────
  {
    const docs = await db.collection('qc_inspections').find().toArray();
    console.log(`🔬 QCInspections: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.qCInspection.create({
          data: {
            id: toId(d._id),
            serialItemId: toId(d.serialItemId),
            templateId: toId(d.templateId),
            inspectorId: toId(d.inspectorId),
            status: d.status || 'PENDING',
            totalScore: d.totalScore ? toFloat(d.totalScore) : null,
            suggestedGrade: d.suggestedGrade ?? null,
            finalGrade: d.finalGrade ?? null,
            notes: d.notes,
            startedAt: toDate(d.startedAt) || new Date(),
            completedAt: toDate(d.completedAt),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ QCInspection: ${e.message}`);
      }
    }
    stats.qcInspections = count;
  }

  // ─── 20. QC INSPECTION ITEMS ──────────────────────────────────────────────
  {
    const docs = await db.collection('qc_inspection_items').find().toArray();
    console.log(`📋 QCInspectionItems: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.qCInspectionItem.create({
          data: {
            id: toId(d._id),
            inspectionId: toId(d.inspectionId),
            checkItemId: toId(d.checkItemId),
            score: d.score ? toInt(d.score) : null,
            passed: d.passed ?? true,
            notes: d.notes,
            photos: d.photos ?? null,
            checkedAt: toDate(d.checkedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ QCInspectionItem: ${e.message}`);
      }
    }
    stats.qcInspectionItems = count;
  }

  // ─── 21. REFURBISHMENT JOBS ───────────────────────────────────────────────
  {
    const docs = await db.collection('refurbishment_jobs').find().toArray();
    console.log(`🔧 RefurbishmentJobs: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.refurbishmentJob.create({
          data: {
            id: toId(d._id),
            serialItemId: toId(d.serialItemId),
            technicianId: toId(d.technicianId),
            status: d.status || 'PLANNED',
            issuesFound: d.issuesFound || '',
            plannedWork: d.plannedWork || '',
            estimatedCost: toFloat(d.estimatedCost),
            actualWork: d.actualWork,
            actualCost: toFloat(d.actualCost),
            startedAt: toDate(d.startedAt),
            completedAt: toDate(d.completedAt),
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ RefurbishmentJob: ${e.message}`);
      }
    }
    stats.refurbishmentJobs = count;
  }

  // ─── 22. PART USAGES ──────────────────────────────────────────────────────
  {
    const docs = await db.collection('part_usages').find().toArray();
    console.log(`⚙️  PartUsages: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.partUsage.create({
          data: {
            id: toId(d._id),
            jobId: toId(d.jobId),
            partName: d.partName,
            quantity: toInt(d.quantity) || 1,
            unitCost: toFloat(d.unitCost),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ PartUsage: ${e.message}`);
      }
    }
    stats.partUsages = count;
  }

  // ─── 23. DYNAMIC SPECS ────────────────────────────────────────────────────
  {
    const docs = await db.collection('dynamic_specs').find().toArray();
    console.log(`🧬 DynamicSpecs: ${docs.length}`);
    let count = 0;
    const seen = new Set<string>();
    for (const d of docs) {
      const key = `${toId(d.serialItemId)}-${toId(d.attributeId)}`;
      if (seen.has(key)) {
        console.warn(`  ⚠️ DynamicSpec duplicate skipped: ${key}`);
        continue;
      }
      seen.add(key);
      try {
        await prisma.dynamicSpec.create({
          data: {
            id: toId(d._id),
            serialItemId: toId(d.serialItemId),
            attributeId: toId(d.attributeId),
            value: d.value ?? '',
            recordedAt: toDate(d.recordedAt) || new Date(),
            recordedById: d.recordedById ? toId(d.recordedById) : null,
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ DynamicSpec: ${e.message}`);
      }
    }
    stats.dynamicSpecs = count;
  }

  // ─── 23b. UPDATE InboundItem.serialItemId (sau khi SerialItems đã import) ──
  {
    const docs = await db.collection('inbound_items').find({ serialItemId: { $ne: null } }).toArray();
    let updated = 0;
    for (const d of docs) {
      if (!d.serialItemId) continue;
      try {
        await prisma.inboundItem.update({
          where: { id: toId(d._id) },
          data: { serialItemId: toId(d.serialItemId) },
        });
        updated++;
      } catch (e: any) {
        console.warn(`  ⚠️ InboundItem update serialItemId ${toId(d._id)}: ${e.message}`);
      }
    }
    console.log(`🔗 InboundItem.serialItemId updated: ${updated}`);
  }

  // ─── 24. SALES ORDERS ─────────────────────────────────────────────────────
  {
    const docs = await db.collection('sales_orders').find().toArray();
    console.log(`🛒 SalesOrders: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.salesOrder.create({
          data: {
            id: toId(d._id),
            code: d.code,
            customerId: d.customerId ? toId(d.customerId) : null,
            warehouseId: toId(d.warehouseId),
            status: d.status || 'DRAFT',
            totalAmount: toFloat(d.totalAmount),
            paidAmount: toFloat(d.paidAmount),
            notes: d.notes,
            salesPersonId: d.salesPersonId ? toId(d.salesPersonId) : null,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ SalesOrder ${d.code}: ${e.message}`);
      }
    }
    stats.salesOrders = count;
  }

  // ─── 25. SALES ORDER ITEMS ────────────────────────────────────────────────
  {
    const docs = await db.collection('sales_order_items').find().toArray();
    console.log(`🧾 SalesOrderItems: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.salesOrderItem.create({
          data: {
            id: toId(d._id),
            salesOrderId: toId(d.salesOrderId),
            serialItemId: toId(d.serialItemId),
            unitPrice: toFloat(d.unitPrice),
            discount: toFloat(d.discount),
            finalPrice: toFloat(d.finalPrice),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ SalesOrderItem: ${e.message}`);
      }
    }
    stats.salesOrderItems = count;
  }

  // ─── 26. STOCK LEVELS ─────────────────────────────────────────────────────
  {
    const docs = await db.collection('stock_levels').find().toArray();
    console.log(`📊 StockLevels: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.stockLevel.create({
          data: {
            id: toId(d._id),
            productTemplateId: toId(d.productTemplateId),
            warehouseId: toId(d.warehouseId),
            grade: d.grade ?? null,
            physicalQty: toInt(d.physicalQty),
            incomingQty: toInt(d.incomingQty),
            qcInProgressQty: toInt(d.qcInProgressQty),
            availableQty: toInt(d.availableQty),
            reservedQty: toInt(d.reservedQty),
            refurbishingQty: toInt(d.refurbishingQty),
            damagedQty: toInt(d.damagedQty),
            returnedQty: toInt(d.returnedQty),
            averageCost: toFloat(d.averageCost),
            totalValue: toFloat(d.totalValue),
            minStockLevel: toInt(d.minStockLevel) || 5,
            maxStockLevel: toInt(d.maxStockLevel) || 100,
            reorderPoint: toInt(d.reorderPoint) || 10,
            createdAt: toDate(d.createdAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ StockLevel: ${e.message}`);
      }
    }
    stats.stockLevels = count;
  }

  // ─── 27. STOCK MOVEMENTS ──────────────────────────────────────────────────
  {
    const docs = await db.collection('stock_movements').find().toArray();
    console.log(`📈 StockMovements: ${docs.length}`);
    let count = 0;
    for (const d of docs) {
      try {
        await prisma.stockMovement.create({
          data: {
            id: toId(d._id),
            productTemplateId: toId(d.productTemplateId),
            warehouseId: toId(d.warehouseId),
            type: d.type || 'IN',
            quantity: toInt(d.quantity),
            referenceType: d.referenceType,
            referenceId: d.referenceId,
            serialItemId: d.serialItemId ? toId(d.serialItemId) : null,
            unitCost: toFloat(d.unitCost),
            totalValue: toFloat(d.totalValue),
            balanceBefore: toInt(d.balanceBefore),
            balanceAfter: toInt(d.balanceAfter),
            notes: d.notes,
            createdById: toSafeId(d.createdById) ?? toId((await db.collection('users').findOne({ role: 'SUPER_ADMIN' }))!._id),
            createdAt: toDate(d.createdAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ StockMovement: ${e.message}`);
      }
    }
    stats.stockMovements = count;
  }

  // ─── 28. SERIAL TRANSACTIONS ──────────────────────────────────────────────
  {
    const docs = await db.collection('serial_transactions').find().toArray();
    console.log(`🔄 SerialTransactions: ${docs.length}`);
    let count = 0;
    // Lấy adminId fallback cho performedById invalid
    const adminDoc = await db.collection('users').findOne({ role: 'SUPER_ADMIN' });
    const adminId = toId(adminDoc!._id);
    for (const d of docs) {
      try {
        await prisma.serialTransaction.create({
          data: {
            id: toId(d._id),
            serialItemId: toId(d.serialItemId),
            type: d.type || 'INBOUND',
            fromLocation: d.fromLocation,
            toLocation: d.toLocation,
            fromStatus: d.fromStatus ?? null,
            toStatus: d.toStatus ?? null,
            costChange: d.costChange ? toFloat(d.costChange) : null,
            notes: d.notes,
            performedById: toSafeId(d.performedById) ?? adminId,
            createdAt: toDate(d.createdAt) || new Date(),
          },
        });
        count++;
      } catch (e: any) {
        console.warn(`  ⚠️ SerialTransaction: ${e.message}`);
      }
    }
    stats.serialTransactions = count;
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('✅ MIGRATION COMPLETE');
  console.log('========================================');
  Object.entries(stats).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(25)} ${v}`);
  });

  await client.close();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Migration failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
