import { PrismaClient, SerialStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.stockMovement.deleteMany({});
    await prisma.stockLevel.deleteMany({});
    await prisma.serialTransaction.deleteMany({});
    await prisma.salesOrderItem.deleteMany({});
    await prisma.salesOrder.deleteMany({});
    await prisma.qCInspectionItem.deleteMany({});
    await prisma.qCInspection.deleteMany({});
    await prisma.qCCheckItem.deleteMany({});
    await prisma.qCTemplate.deleteMany({});
    await prisma.dynamicSpec.deleteMany({});
    await prisma.productSpec.deleteMany({});
    await prisma.partUsage.deleteMany({});
    await prisma.refurbishmentJob.deleteMany({});
    await prisma.inboundItem.deleteMany({});
    await prisma.inboundRequest.deleteMany({});
    await prisma.serialItem.deleteMany({});
    await prisma.binLocation.deleteMany({});
    await prisma.attribute.deleteMany({});
    await prisma.attributeGroup.deleteMany({});
    await prisma.productTemplate.deleteMany({});
    await prisma.brandCategory.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.user.deleteMany({});
  }

  // ============== USERS ==============
  console.log('👤 Creating users...');
  const defaultPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@celebi.com', password: defaultPassword, fullName: 'Quản trị viên', role: 'SUPER_ADMIN', isActive: true },
  });
  const cashier = await prisma.user.create({
    data: { email: 'cashier@celebi.com', password: defaultPassword, fullName: 'Nhân viên Thu Ngân', role: 'CASHIER', isActive: true },
  });
  await prisma.user.create({
    data: { email: 'qc@celebi.com', password: defaultPassword, fullName: 'Nhân viên QC', role: 'QC_INSPECTOR', isActive: true },
  });

  // ============== WAREHOUSES ==============
  console.log('🏭 Creating warehouses...');
  const whMain = await prisma.warehouse.create({
    data: { code: 'WH-MAIN', name: 'Kho Trung Tâm', address: 'Quận 1, TP.HCM', isActive: true },
  });
  await prisma.warehouse.create({
    data: { code: 'WH-SUB', name: 'Kho Phụ (Tân Bình)', address: 'Tân Bình, TP.HCM', isActive: true },
  });

  // ============== CUSTOMERS & SUPPLIERS ==============
  console.log('👥 Creating partners...');
  const customer1 = await prisma.customer.create({
    data: { code: 'CUS-001', fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'nva@gmail.com', address: 'Quận 3' },
  });
  await prisma.customer.create({
    data: { code: 'CUS-002', fullName: 'Trần Thị B', phone: '0987654321', email: 'ttb@gmail.com', address: 'Quận 10' },
  });

  await prisma.supplier.create({
    data: { name: 'Công ty TNHH Cung Cấp ABC', code: 'SUP-001', phone: '0281234567', address: 'Mỹ', taxCode: '123456789' },
  });
  await prisma.supplier.create({
    data: { name: 'Đại lý Thu mua lẻ Nhỏ', code: 'SUP-002', phone: '0287654321', address: 'VN' },
  });

  // ============== CATEGORIES ==============
  console.log('📂 Creating categories...');
  const catPhone = await prisma.category.create({
    data: { name: 'Điện thoại di động', code: 'PHONE', productType: 'ELECTRONICS' },
  });
  const catTablet = await prisma.category.create({
    data: { name: 'Máy tính bảng', code: 'TABLET', productType: 'ELECTRONICS' },
  });
  const catLaptop = await prisma.category.create({
    data: { name: 'Laptop', code: 'LAPTOP', productType: 'COMPUTER' },
  });
  const catWatch = await prisma.category.create({
    data: { name: 'Đồng hồ thông minh', code: 'WATCH', productType: 'ELECTRONICS' },
  });
  const catEarphone = await prisma.category.create({
    data: { name: 'Tai nghe', code: 'EARPHONE', productType: 'ACCESSORY' },
  });

  // ============== BRANDS ==============
  console.log('🏷️ Creating brands...');
  const brandApple = await prisma.brand.create({ data: { name: 'Apple', code: 'APPLE' } });
  const brandSamsung = await prisma.brand.create({ data: { name: 'Samsung', code: 'SAMSUNG' } });
  const brandXiaomi = await prisma.brand.create({ data: { name: 'Xiaomi', code: 'XIAOMI' } });
  const brandOppo = await prisma.brand.create({ data: { name: 'OPPO', code: 'OPPO' } });
  const brandVivo = await prisma.brand.create({ data: { name: 'Vivo', code: 'VIVO' } });
  const brandRealme = await prisma.brand.create({ data: { name: 'Realme', code: 'REALME' } });
  const brandOnePlus = await prisma.brand.create({ data: { name: 'OnePlus', code: 'ONEPLUS' } });
  const brandGoogle = await prisma.brand.create({ data: { name: 'Google', code: 'GOOGLE' } });
  const brandSony = await prisma.brand.create({ data: { name: 'Sony', code: 'SONY' } });
  const brandDell = await prisma.brand.create({ data: { name: 'Dell', code: 'DELL' } });
  const brandAsus = await prisma.brand.create({ data: { name: 'Asus', code: 'ASUS' } });
  const brandLenovo = await prisma.brand.create({ data: { name: 'Lenovo', code: 'LENOVO' } });
  const brandHP = await prisma.brand.create({ data: { name: 'HP', code: 'HP' } });
  const brandMSI = await prisma.brand.create({ data: { name: 'MSI', code: 'MSI' } });

  // ============== BRAND-CATEGORY BINDINGS ==============
  console.log('🔗 Binding brands to categories...');
  const bindings: Array<{ brandId: string; categoryId: string }> = [
    // Phones
    ...[ brandApple, brandSamsung, brandXiaomi, brandOppo, brandVivo, brandRealme, brandOnePlus, brandGoogle, brandSony ]
      .map(b => ({ brandId: b.id, categoryId: catPhone.id })),
    // Tablets
    ...[ brandApple, brandSamsung, brandXiaomi, brandLenovo ]
      .map(b => ({ brandId: b.id, categoryId: catTablet.id })),
    // Laptops
    ...[ brandApple, brandDell, brandAsus, brandLenovo, brandHP, brandMSI ]
      .map(b => ({ brandId: b.id, categoryId: catLaptop.id })),
    // Watches
    ...[ brandApple, brandSamsung, brandXiaomi, brandOppo, brandGoogle ]
      .map(b => ({ brandId: b.id, categoryId: catWatch.id })),
    // Earphones
    ...[ brandApple, brandSamsung, brandSony, brandXiaomi, brandOnePlus ]
      .map(b => ({ brandId: b.id, categoryId: catEarphone.id })),
  ];
  for (const pair of bindings) {
    await prisma.brandCategory.create({ data: pair });
  }

  // ============== PRODUCT TEMPLATES ==============
  console.log('📱 Creating product templates...');
  const tplIP15 = await prisma.productTemplate.create({
    data: { sku: 'IP15-PM-256', name: 'iPhone 15 Pro Max 256GB', categoryId: catPhone.id, brandId: brandApple.id, baseRetailPrice: 25000000, baseWholesalePrice: 22000000 },
  });
  const tplS24 = await prisma.productTemplate.create({
    data: { sku: 'SS-S24U-512', name: 'Samsung Galaxy S24 Ultra 512GB', categoryId: catPhone.id, brandId: brandSamsung.id, baseRetailPrice: 24000000, baseWholesalePrice: 20000000 },
  });
  const tplIPad = await prisma.productTemplate.create({
    data: { sku: 'IPAD-PRO-M4', name: 'iPad Pro M4 256GB Wifi', categoryId: catTablet.id, brandId: brandApple.id, baseRetailPrice: 28000000, baseWholesalePrice: 25000000 },
  });
  const tplMac = await prisma.productTemplate.create({
    data: { sku: 'MAC-AIR-M3', name: 'MacBook Air M3 13-inch', categoryId: catLaptop.id, brandId: brandApple.id, baseRetailPrice: 26000000, baseWholesalePrice: 23000000 },
  });
  await prisma.productTemplate.create({
    data: { sku: 'SS-S25-256', name: 'Samsung Galaxy S25 256GB', categoryId: catPhone.id, brandId: brandSamsung.id, baseRetailPrice: 22000000, baseWholesalePrice: 18000000 },
  });
  await prisma.productTemplate.create({
    data: { sku: 'IP14-128', name: 'iPhone 14 128GB', categoryId: catPhone.id, brandId: brandApple.id, baseRetailPrice: 16000000, baseWholesalePrice: 13000000 },
  });

  // ============== ATTRIBUTE GROUPS & ATTRIBUTES ==============
  console.log('⚙️ Creating attribute groups...');

  // Phone attributes
  const agPhoneBase = await prisma.attributeGroup.create({
    data: { name: 'Thông số chung', categoryId: catPhone.id, sortOrder: 1 },
  });
  const agPhoneTech = await prisma.attributeGroup.create({
    data: { name: 'Thông số kỹ thuật', categoryId: catPhone.id, sortOrder: 2 },
  });
  const attrColor = await prisma.attribute.create({
    data: {
      attributeGroupId: agPhoneBase.id,
      name: 'Màu sắc', key: 'color', type: 'SELECT', isRequired: true,
      options: ['Đen', 'Trắng', 'Natural Titanium', 'Xanh dương', 'Vàng', 'Hồng', 'Bạc', 'Xám', 'Tím'],
    },
  });
  const attrBattery = await prisma.attribute.create({
    data: {
      attributeGroupId: agPhoneTech.id,
      name: 'Tình trạng Pin (%)', key: 'batteryHealth', type: 'NUMBER', isRequired: true,
      minValue: 0, maxValue: 100,
    },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agPhoneTech.id,
      name: 'Dung lượng (GB)', key: 'storage', type: 'SELECT', isRequired: true,
      options: ['64', '128', '256', '512', '1024'],
    },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agPhoneTech.id,
      name: 'RAM (GB)', key: 'ram', type: 'SELECT', isRequired: false,
      options: ['4', '6', '8', '12', '16'],
    },
  });

  // Laptop attributes
  const agLaptopSpecs = await prisma.attributeGroup.create({
    data: { name: 'Cấu hình', categoryId: catLaptop.id, sortOrder: 1 },
  });
  await prisma.attribute.create({
    data: { attributeGroupId: agLaptopSpecs.id, name: 'CPU', key: 'cpu', type: 'TEXT', isRequired: true },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agLaptopSpecs.id, name: 'RAM (GB)', key: 'ram_gb', type: 'SELECT', isRequired: true,
      options: ['8', '16', '32', '64'],
    },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agLaptopSpecs.id, name: 'SSD (GB)', key: 'ssd_gb', type: 'SELECT', isRequired: true,
      options: ['256', '512', '1024', '2048'],
    },
  });
  await prisma.attribute.create({
    data: { attributeGroupId: agLaptopSpecs.id, name: 'Màn hình (inch)', key: 'screen_inch', type: 'DECIMAL', isRequired: false },
  });

  // Tablet attributes
  const agTabletSpecs = await prisma.attributeGroup.create({
    data: { name: 'Thông số máy tính bảng', categoryId: catTablet.id, sortOrder: 1 },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agTabletSpecs.id, name: 'Màu sắc', key: 'color', type: 'SELECT', isRequired: true,
      options: ['Đen', 'Trắng', 'Bạc', 'Xanh dương', 'Xám'],
    },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agTabletSpecs.id, name: 'Dung lượng (GB)', key: 'storage', type: 'SELECT', isRequired: true,
      options: ['64', '128', '256', '512', '1024'],
    },
  });
  await prisma.attribute.create({
    data: {
      attributeGroupId: agTabletSpecs.id, name: 'Kết nối', key: 'connectivity', type: 'SELECT', isRequired: false,
      options: ['Wifi', 'Wifi + 4G', 'Wifi + 5G'],
    },
  });

  // ============== INBOUND REQUEST (Trade-in sample) ==============
  console.log('🚚 Creating inbound request...');
  await prisma.inboundRequest.create({
    data: {
      code: 'INB-202403-001',
      warehouseId: whMain.id,
      supplierType: 'INDIVIDUAL_SELLER',
      supplierName: 'Nguyễn Văn Test',
      supplierPhone: '0901111222',
      status: 'IN_PROGRESS',
      notes: 'Nhập hàng đợt 1',
      items: {
        create: [
          {
            categoryId: catPhone.id,
            brandId: brandApple.id,
            productTemplateId: tplIP15.id,
            modelName: 'iPhone 15 Pro Max 256GB',
            serialNumber: 'IP15-TEST-001',
            condition: 'Tốt',
            estimatedValue: 21000000,
          },
        ],
      },
    },
  });

  // ============== SERIAL ITEMS (INVENTORY) ==============
  console.log('📦 Creating serial items...');
  const serialData = [
    { sn: 'IP15-001', tpl: tplIP15.id, status: 'AVAILABLE' as SerialStatus, price: 25000000, cost: 21500000, color: 'Natural Titanium', pin: 100 },
    { sn: 'IP15-002', tpl: tplIP15.id, status: 'AVAILABLE' as SerialStatus, price: 23500000, cost: 21000000, color: 'Trắng', pin: 89 },
    { sn: 'IP15-003', tpl: tplIP15.id, status: 'SOLD' as SerialStatus, price: 24000000, cost: 21500000, color: 'Đen', pin: 95 },
    { sn: 'IP15-004', tpl: tplIP15.id, status: 'INCOMING' as SerialStatus, price: 0, cost: 21500000, color: null, pin: null },
    { sn: 'S24-001', tpl: tplS24.id, status: 'AVAILABLE' as SerialStatus, price: 23800000, cost: 19500000, color: 'Đen', pin: 99 },
    { sn: 'S24-002', tpl: tplS24.id, status: 'AVAILABLE' as SerialStatus, price: 23000000, cost: 19000000, color: 'Xám', pin: 92 },
    { sn: 'MAC-001', tpl: tplMac.id, status: 'AVAILABLE' as SerialStatus, price: 25500000, cost: 22000000, color: 'Bạc', pin: 96 },
    { sn: 'IPAD-001', tpl: tplIPad.id, status: 'RESERVED' as SerialStatus, price: 27500000, cost: 24500000, color: 'Xám', pin: 100 },
    { sn: 'IPAD-002', tpl: tplIPad.id, status: 'DISPOSED' as SerialStatus, price: 0, cost: 24000000, color: 'Đen', pin: 0 },
  ];

  const dbSerials = [];
  for (const s of serialData) {
    const dynamicSpecs = s.color && s.pin !== null
      ? {
          create: [
            { attributeId: attrColor.id, value: s.color },
            { attributeId: attrBattery.id, value: s.pin },
          ],
        }
      : undefined;

    const dbItem = await prisma.serialItem.create({
      data: {
        productTemplate: { connect: { id: s.tpl } },
        warehouse: { connect: { id: whMain.id } },
        serialNumber: s.sn,
        internalCode: `CEL-${s.sn}`,
        status: s.status,
        purchasePrice: s.cost,
        currentCostPrice: s.cost,
        suggestedPrice: s.price,
        purchaseDate: new Date(),
        dynamicSpecs,
      },
    });
    dbSerials.push(dbItem);
  }

  // ============== SALES ORDERS ==============
  console.log('💳 Creating sales orders...');
  const itemSold = dbSerials.find(x => x.serialNumber === 'IP15-003');
  if (itemSold) {
    await prisma.salesOrder.create({
      data: {
        code: 'SO-202403-001',
        warehouseId: whMain.id,
        customerId: customer1.id,
        salesPersonId: cashier.id,
        status: 'COMPLETED',
        totalAmount: 24000000,
        paidAmount: 24000000,
        notes: 'Khách thanh toán chuyển khoản',
        items: {
          create: [{ serialItemId: itemSold.id, unitPrice: 25000000, discount: 1000000, finalPrice: 24000000 }],
        },
      },
    });

    await prisma.serialTransaction.create({
      data: {
        serialItemId: itemSold.id,
        type: 'SOLD',
        fromStatus: 'AVAILABLE',
        toStatus: 'SOLD',
        performedById: cashier.id,
        notes: 'Bán hàng POS',
      },
    });
  }

  const itemReserved = dbSerials.find(x => x.serialNumber === 'IPAD-001');
  if (itemReserved) {
    await prisma.serialTransaction.create({
      data: {
        serialItemId: itemReserved.id,
        type: 'RESERVED',
        fromStatus: 'AVAILABLE',
        toStatus: 'RESERVED',
        performedById: admin.id,
        notes: 'Khách đặt cọc',
      },
    });
  }

  console.log('');
  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('  Admin:   admin@celebi.com / 123456');
  console.log('  Cashier: cashier@celebi.com / 123456');
  console.log('  QC:      qc@celebi.com / 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
