import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MINIMAL SERIAL-BASED database seeding...');

  // Clean existing data (development only)  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    
    // Clean in correct order (foreign keys)
    await prisma.serialTransaction.deleteMany();
    await prisma.partUsage.deleteMany();
    await prisma.refurbishmentJob.deleteMany();
    await prisma.qCInspectionItem.deleteMany();
    await prisma.qCInspection.deleteMany();
    await prisma.dynamicSpec.deleteMany();
    await prisma.productSpec.deleteMany();
    await prisma.serialItem.deleteMany();
    await prisma.binLocation.deleteMany();
    await prisma.productTemplate.deleteMany();
    await prisma.attribute.deleteMany();
    await prisma.attributeGroup.deleteMany();
    await prisma.qCCheckItem.deleteMany();
    await prisma.qCTemplate.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.user.deleteMany();
  }

  // ============== USERS ==============
  console.log('👤 Creating users...');
  
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const qcPassword = await bcrypt.hash('QC@123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@celebi.com',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'qc@celebi.com', 
      password: qcPassword,
      fullName: 'QC Inspector',
      role: 'QC_INSPECTOR',
      isActive: true,
    },
  });

  // ============== CATEGORIES ==============
  console.log('📂 Creating categories...');
  
  const phoneCategory = await prisma.category.create({
    data: {
      name: 'Điện thoại di động',
      code: 'PHONE',
      productType: 'ELECTRONICS',
      description: 'Smartphone và điện thoại cũ',
    },
  });

  // ============== BRANDS ==============
  console.log('🏷️ Creating brands...');

  const apple = await prisma.brand.create({
    data: {
      name: 'Apple',
      code: 'APPLE',
    },
  });

  // ============== WAREHOUSES ==============
  console.log('🏭 Creating warehouses...');

  const mainWarehouse = await prisma.warehouse.create({
    data: {
      code: 'WH-MAIN',
      name: 'Kho chính Celebi',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      isActive: true,
    },
  });

  // ============== PRODUCT TEMPLATES ==============
  console.log('📱 Creating product templates...');

  const iPhone15Template = await prisma.productTemplate.create({
    data: {
      sku: 'IPHONE-15-256',
      name: 'iPhone 15',
      categoryId: phoneCategory.id,
      brandId: apple.id,
      model: '15',
      baseRetailPrice: 25000000,
      description: 'iPhone 15 second-hand',
    },
  });

  // ============== SAMPLE SERIAL ITEMS ==============
  console.log('📦 Creating sample serial items...');

  await prisma.serialItem.create({
    data: {
      productTemplateId: iPhone15Template.id,
      warehouseId: mainWarehouse.id,
      serialNumber: '359123456789001',
      internalCode: 'CEL-001',
      status: 'AVAILABLE',
      grade: 'GRADE_A',
      purchasePrice: 18000000,
      currentCostPrice: 18000000,
      suggestedPrice: 22000000,
      conditionNotes: 'Tình trạng rất tốt, ít dấu hiệu sử dụng',
      source: 'Thu mua trực tiếp',
      purchaseDate: new Date('2024-01-15'),
      binLocation: 'B01-2-1',
    },
  });

  await prisma.serialItem.create({
    data: {
      productTemplateId: iPhone15Template.id,
      warehouseId: mainWarehouse.id,
      serialNumber: '359123456789002',
      internalCode: 'CEL-002',
      status: 'INCOMING',  // 🔄 Changed to INCOMING for QC testing
      grade: null,         // 🔄 No grade yet, pending QC
      purchasePrice: 12000000,
      currentCostPrice: 12000000,
      suggestedPrice: null,  // 🔄 Will be set after QC
      conditionNotes: null,  // 🔄 Will be set after QC
      source: 'Đổi trả bảo hành',
      purchaseDate: new Date('2024-01-20'),
      binLocation: 'A01-1-1',
    },
  });

  // ============== QC TEMPLATES ==============
  console.log('🔍 Creating QC templates...');

  const phoneQCTemplate = await prisma.qCTemplate.create({
    data: {
      name: 'Kiểm tra điện thoại',
      categoryId: phoneCategory.id,
      description: 'Template kiểm tra chất lượng điện thoại second-hand',
    },
  });

  // Create QC check items for phone inspection
  await prisma.qCCheckItem.create({
    data: {
      templateId: phoneQCTemplate.id,
      section: 'Display',
      item: 'Màn hình',
      type: 'VISUAL_CHECK',
      description: 'Kiểm tra màn hình: vết trầy, vỡ, dead pixel, độ sáng',
      isRequired: true,
      maxScore: 25,
      sortOrder: 1
    },
  });

  await prisma.qCCheckItem.create({
    data: {
      templateId: phoneQCTemplate.id,
      section: 'Hardware', 
      item: 'Pin',
      type: 'MEASUREMENT',
      description: 'Kiểm tra dung lượng pin và thời gian sạc',
      isRequired: true,
      maxScore: 20,
      sortOrder: 2
    },
  });

  await prisma.qCCheckItem.create({
    data: {
      templateId: phoneQCTemplate.id,
      section: 'Hardware',
      item: 'Camera',
      type: 'FUNCTION_TEST',
      description: 'Test camera trước/sau, focus, flash',
      isRequired: false,
      maxScore: 15,
      sortOrder: 3
    },
  });

  await prisma.qCCheckItem.create({
    data: {
      templateId: phoneQCTemplate.id,
      section: 'Exterior',
      item: 'Vỏ máy', 
      type: 'VISUAL_CHECK',
      description: 'Kiểm tra vỏ máy: móp méo, trầy xước, nút bấm',
      isRequired: true,
      maxScore: 20,
      sortOrder: 4
    },
  });

  await prisma.qCCheckItem.create({
    data: {
      templateId: phoneQCTemplate.id,
      section: 'Accessories',
      item: 'Phụ kiện',
      type: 'ACCESSORY_COUNT',
      description: 'Hộp, cáp sạc, sách hướng dẫn, earphones',
      isRequired: false,
      maxScore: 10,
      sortOrder: 5
    },
  });

  await prisma.qCCheckItem.create({
    data: {
      templateId: phoneQCTemplate.id,
      section: 'Software',
      item: 'Chức năng cơ bản',
      type: 'FUNCTION_TEST',
      description: 'WiFi, Bluetooth, sim, cảm ứng, loa, mic',
      isRequired: true,
      maxScore: 10,
      sortOrder: 6
    },
  });

  console.log('✅ MINIMAL Serial-based database seeding completed successfully!');
  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@celebi.com / Admin@123');
  console.log('   QC: qc@celebi.com / QC@123');
  console.log('📦 Created 2 sample serial items for Apple iPhone 15');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });