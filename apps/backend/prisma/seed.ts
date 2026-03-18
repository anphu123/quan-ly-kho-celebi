import { PrismaClient, SerialStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    const tableNames = [
      'serial_transactions', 'sales_order_items', 'sales_orders',
      'inbound_items', 'inbound_requests', 'suppliers', 'customers',
      'dynamic_specs', 'product_specs', 'serial_items', 'bin_locations',
      'product_templates', 'attributes', 'attribute_groups',
      'qc_check_items', 'qc_templates', 'categories', 'brands',
      'warehouses', 'users'
    ];
    for (const tableName of tableNames) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    }
  }

  // ============== USERS ==============
  console.log('👤 Creating users...');
  const defaultPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({ data: { email: 'admin@celebi.com', password: defaultPassword, fullName: 'Quản trị viên', role: 'SUPER_ADMIN', isActive: true } });
  const cashier = await prisma.user.create({ data: { email: 'cashier@celebi.com', password: defaultPassword, fullName: 'Nhân viên Thu Ngân', role: 'CASHIER', isActive: true } });
  const qc = await prisma.user.create({ data: { email: 'qc@celebi.com', password: defaultPassword, fullName: 'Nhân viên QC', role: 'QC_INSPECTOR', isActive: true } });

  // ============== WAREHOUSES ==============
  console.log('🏭 Creating warehouses...');
  const whMain = await prisma.warehouse.create({ data: { code: 'WH-MAIN', name: 'Kho Trung Tâm', address: 'Quận 1, TP.HCM', isActive: true } });
  const whSub = await prisma.warehouse.create({ data: { code: 'WH-SUB', name: 'Kho Phụ (Tân Bình)', address: 'Tân Bình, TP.HCM', isActive: true } });

  // ============== CUSTOMERS & SUPPLIERS ==============
  console.log('👥 Creating partners...');
  const customer1 = await prisma.customer.create({ data: { fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'nva@gmail.com', address: 'Quận 3' } });
  const customer2 = await prisma.customer.create({ data: { fullName: 'Trần Thị B', phone: '0987654321', email: 'ttb@gmail.com', address: 'Quận 10' } });

  const supplier1 = await prisma.supplier.create({ data: { name: 'Công ty TNHH Cung Cấp ABC', code: 'SUP-001', phone: '0281234567', address: 'Mỹ', taxCode: '123456789' } });
  const supplier2 = await prisma.supplier.create({ data: { name: 'Đại lý Thu mua lẻ Nhỏ', code: 'SUP-002', phone: '0287654321', address: 'VN' } });

  // ============== CATEGORIES & BRANDS ==============
  console.log('📂 Creating catalog base...');
  const catPhone = await prisma.category.create({ data: { name: 'Điện thoại di động', code: 'PHONE', productType: 'ELECTRONICS' } });
  const catTablet = await prisma.category.create({ data: { name: 'Máy tính bảng', code: 'TABLET', productType: 'ELECTRONICS' } });
  const catLaptop = await prisma.category.create({ data: { name: 'Laptop', code: 'LAPTOP', productType: 'COMPUTER' } });

  const brandApple = await prisma.brand.create({ data: { name: 'Apple', code: 'APPLE' } });
  const brandSamsung = await prisma.brand.create({ data: { name: 'Samsung', code: 'SAMSUNG' } });

  // ============== PRODUCT TEMPLATES ==============
  console.log('📱 Creating product templates...');
  const tplIP15 = await prisma.productTemplate.create({ data: { sku: 'IP15-PM-256', name: 'iPhone 15 Pro Max 256GB', categoryId: catPhone.id, brandId: brandApple.id, baseRetailPrice: 25000000, baseWholesalePrice: 22000000 } });
  const tplS24 = await prisma.productTemplate.create({ data: { sku: 'SS-S24U-512', name: 'Samsung Galaxy S24 Ultra 512GB', categoryId: catPhone.id, brandId: brandSamsung.id, baseRetailPrice: 24000000, baseWholesalePrice: 20000000 } });
  const tplIPad = await prisma.productTemplate.create({ data: { sku: 'IPAD-PRO-M4', name: 'iPad Pro M4 256GB Wifi', categoryId: catTablet.id, brandId: brandApple.id, baseRetailPrice: 28000000, baseWholesalePrice: 25000000 } });
  const tplMac = await prisma.productTemplate.create({ data: { sku: 'MAC-AIR-M3', name: 'MacBook Air M3 13-inch', categoryId: catLaptop.id, brandId: brandApple.id, baseRetailPrice: 26000000, baseWholesalePrice: 23000000 } });

  // ============== ATTRIBUTES (EAV) ==============
  console.log('⚙️ Creating attribute groups...');
  const attrGroupBase = await prisma.attributeGroup.create({ data: { name: 'Thông số chung', description: 'Màu sắc, Ngoại hình', categoryId: catPhone.id } });
  const attrGroupTech = await prisma.attributeGroup.create({ data: { name: 'Thông số kỹ thuật', description: 'Pin, Sạc', categoryId: catPhone.id } });

  const attrColor = await prisma.attribute.create({ data: { groupId: attrGroupBase.id, name: 'Màu sắc', key: 'color', type: 'SELECT', required: true, options: JSON.stringify(['Đen', 'Trắng', 'Natural Titanium', 'Xanh dương']) } });
  const attrBattery = await prisma.attribute.create({ data: { groupId: attrGroupTech.id, name: 'Tình trạng Pin (%)', key: 'batteryHealth', type: 'NUMBER', required: true } });
  const attrStorage = await prisma.attribute.create({ data: { groupId: attrGroupTech.id, name: 'Dung lượng (GB)', key: 'storage', type: 'SELECT', required: true, options: JSON.stringify(['128', '256', '512', '1024']) } });

  // ============== INBOUND REQUESTS ==============
  console.log('🚚 Creating inbound requests...');
  const inbound1 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-202403-001',
      warehouseId: whMain.id,
      supplierId: supplier1.id,
      status: 'QC_IN_PROGRESS',
      notes: 'Nhập hàng đợt 1',
      createdBy: admin.id,
      items: {
        create: [
          { productTemplateId: tplIP15.id, expectedQuantity: 2, receivedQuantity: 1, unitCost: 21500000 },
          { productTemplateId: tplS24.id, expectedQuantity: 1, receivedQuantity: 0, unitCost: 19500000 }
        ]
      }
    }
  });

  const inbound2 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-202403-002',
      warehouseId: whMain.id,
      supplierId: supplier2.id,
      status: 'COMPLETED',
      notes: 'Hàng thu mua khách lẻ',
      createdBy: admin.id,
      items: {
        create: [
          { productTemplateId: tplMac.id, expectedQuantity: 1, receivedQuantity: 1, unitCost: 22000000 }
        ]
      }
    }
  });

  // ============== SERIAL ITEMS (INVENTORY) ==============
  console.log('📦 Creating serial items...');
  const serials = [
    { sn: 'IP15-001', tpl: tplIP15.id, status: 'AVAILABLE', price: 25000000, cost: 21500000, color: 'Natural Titanium', pin: '100' },
    { sn: 'IP15-002', tpl: tplIP15.id, status: 'AVAILABLE', price: 23500000, cost: 21000000, color: 'Trắng', pin: '89' },
    { sn: 'IP15-003', tpl: tplIP15.id, status: 'SOLD', price: 24000000, cost: 21500000, color: 'Đen', pin: '95' },
    { sn: 'IP15-004', tpl: tplIP15.id, status: 'INCOMING', price: null, cost: 21500000, color: null, pin: null }, // from inbound1
    { sn: 'S24-001', tpl: tplS24.id, status: 'AVAILABLE', price: 23800000, cost: 19500000, color: 'Đen', pin: '99' },
    { sn: 'S24-002', tpl: tplS24.id, status: 'AVAILABLE', price: 23000000, cost: 19000000, color: 'Xám', pin: '92' },
    { sn: 'MAC-001', tpl: tplMac.id, status: 'AVAILABLE', price: 25500000, cost: 22000000, color: 'Bạc', pin: '96' },
    { sn: 'IPAD-001', tpl: tplIPad.id, status: 'RESERVED', price: 27500000, cost: 24500000, color: 'Xám', pin: '100' },
    { sn: 'IPAD-002', tpl: tplIPad.id, status: 'DISPOSED', price: null, cost: 24000000, color: 'Đen', pin: '0' },
  ];

  const dbSerials = [];
  for (const s of serials) {
    const dbItem = await prisma.serialItem.create({
      data: {
        productTemplateId: s.tpl,
        warehouseId: whMain.id,
        serialNumber: s.sn,
        internalCode: `CEL-${s.sn}`,
        status: s.status as SerialStatus,
        purchasePrice: s.cost,
        currentCostPrice: s.cost,
        suggestedPrice: s.price,
        purchaseDate: new Date(),
        dynamicSpecs: s.color && s.pin ? {
          create: [
            { attributeId: attrColor.id, valueString: s.color },
            { attributeId: attrBattery.id, valueNumber: parseInt(s.pin) }
          ]
        } : undefined
      }
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
          create: [
            { serialItemId: itemSold.id, unitPrice: 25000000, discount: 1000000, finalPrice: 24000000 }
          ]
        }
      }
    });

    // Create tx log for sold item
    await prisma.serialTransaction.create({
      data: {
        serialItemId: itemSold.id,
        type: 'SOLD',
        fromStatus: 'AVAILABLE',
        toStatus: 'SOLD',
        performedById: cashier.id,
        notes: 'Bán hàng POS'
      }
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
        notes: 'Chuyển kho nội bộ (đang chờ)'
      }
    });
  }

  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('Admin account: admin@celebi.com / 123456');
  console.log('Cashier account: cashier@celebi.com / 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());