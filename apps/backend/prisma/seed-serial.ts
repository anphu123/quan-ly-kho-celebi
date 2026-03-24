import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding serial-based database...')

  // Clear existing data (in reverse dependency order)
  console.log('🧹 Clearing existing data...')

  const tableNames = [
    'serial_transactions', 'sales_order_items', 'sales_orders',
    'trade_in_items', 'suppliers', 'customers',
    'dynamic_specs', 'product_specs', 'serial_items', 'bin_locations',
    'product_templates', 'attributes', 'attribute_groups',
    'qc_check_items', 'qc_templates', 'categories', 'brands',
    'warehouses', 'users'
  ];
  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    } catch (e) {
      // Ignore if table doesn't exist
    }
  }

  console.log('✅ Existing data cleared')

  // Hash passwords properly
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  const qcPassword = await bcrypt.hash('QC@123', 10)
  const techPassword = await bcrypt.hash('Tech@123', 10)

  // Create User (Admin)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@celebi.com',
      password: adminPassword, // Admin@123 properly hashed
      fullName: 'Quản trị viên',
      role: 'SUPER_ADMIN',
    },
  })

  // Create Quality Control Inspector
  const qcInspector = await prisma.user.create({
    data: {
      email: 'qc@celebi.com',
      password: qcPassword, // QC@123 properly hashed
      fullName: 'Nguyễn Thị Kiểm',
      role: 'QC_INSPECTOR',
    },
  })

  const technician = await prisma.user.create({
    data: {
      email: 'tech@celebi.com',
      password: techPassword, // Tech@123 properly hashed
      fullName: 'Trần Văn Sửa',
      role: 'TECHNICIAN',
    },
  })

  // Create Cashier
  const cashierPassword = await bcrypt.hash('Cashier@123', 10)
  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@celebi.com',
      password: cashierPassword,
      fullName: 'Phạm Thu Ngân',
      role: 'CASHIER',
    },
  })

  // Create Categories with different tracking methods
  const smartphoneCategory = await prisma.category.create({
    data: {
      name: 'Smartphone',
      code: 'SMARTPHONE',
      productType: 'ELECTRONICS',
      trackingMethod: 'SERIAL_BASED',
      description: 'Điện thoại thông minh cũ',
    },
  })

  const laptopCategory = await prisma.category.create({
    data: {
      name: 'Laptop',
      code: 'LAPTOP',
      productType: 'ELECTRONICS',
      trackingMethod: 'SERIAL_BASED',
      description: 'Laptop và máy tính xách tay cũ',
    },
  })

  const applianceCategory = await prisma.category.create({
    data: {
      name: 'Tivi',
      code: 'TV',
      productType: 'APPLIANCE_LARGE',
      trackingMethod: 'SERIAL_BASED',
      description: 'TV và màn hình cũ',
    },
  })

  // Create Brands
  const apple = await prisma.brand.create({
    data: { name: 'Apple', code: 'APPLE' },
  })

  const samsung = await prisma.brand.create({
    data: { name: 'Samsung', code: 'SAMSUNG' },
  })

  const lg = await prisma.brand.create({
    data: { name: 'LG', code: 'LG' },
  })

  // Create Attribute Groups for Smartphones
  const hardwareGroup = await prisma.attributeGroup.create({
    data: {
      categoryId: smartphoneCategory.id,
      name: 'Thông số kỹ thuật',
      description: 'Các thông số phần cứng của điện thoại',
      sortOrder: 1,
    },
  })

  const conditionGroup = await prisma.attributeGroup.create({
    data: {
      categoryId: smartphoneCategory.id,
      name: 'Tình trạng ngoại quan',
      description: 'Đánh giá tình trạng vỏ ngoài và linh kiện',
      sortOrder: 2,
    },
  })

  // Create Attributes for Smartphones
  const ramAttribute = await prisma.attribute.create({
    data: {
      attributeGroupId: hardwareGroup.id,
      key: 'ram_gb',
      name: 'RAM (GB)',
      type: 'NUMBER',
      isRequired: true,
      minValue: 1,
      maxValue: 64,
      sortOrder: 1,
    },
  })

  const storageAttribute = await prisma.attribute.create({
    data: {
      attributeGroupId: hardwareGroup.id,
      key: 'storage_gb',
      name: 'Bộ nhớ trong (GB)',
      type: 'SELECT',
      isRequired: true,
      options: ['64', '128', '256', '512', '1024'],
      sortOrder: 2,
    },
  })

  const batteryHealthAttribute = await prisma.attribute.create({
    data: {
      attributeGroupId: hardwareGroup.id,
      key: 'battery_health',
      name: 'Độ chai pin (%)',
      type: 'NUMBER',
      isRequired: true,
      minValue: 0,
      maxValue: 100,
      sortOrder: 3,
    },
  })

  const screenConditionAttribute = await prisma.attribute.create({
    data: {
      attributeGroupId: conditionGroup.id,
      key: 'screen_condition',
      name: 'Tình trạng màn hình',
      type: 'SELECT',
      isRequired: true,
      options: ['Hoàn hảo', 'Trầy xước nhẹ', 'Trầy xước nhiều', 'Vỡ', 'Hỏng nặng'],
      sortOrder: 1,
    },
  })

  // Create Product Templates
  const iPhone15Pro = await prisma.productTemplate.create({
    data: {
      sku: 'IPHONE-15-PRO-256',
      name: 'iPhone 15 Pro 256GB',
      model: 'A3108',
      description: 'iPhone 15 Pro Natural Titanium 256GB',
      categoryId: smartphoneCategory.id,
      brandId: apple.id,
      baseWholesalePrice: 22000000, // 22 triệu thu mua Grade A
      baseRetailPrice: 26000000,    // 26 triệu bán Grade A
    },
  })

  const samsungS23 = await prisma.productTemplate.create({
    data: {
      sku: 'SAMSUNG-S23-256',
      name: 'Samsung Galaxy S23 256GB',
      model: 'SM-S911B',
      description: 'Samsung Galaxy S23 Phantom Black 256GB',
      categoryId: smartphoneCategory.id,
      brandId: samsung.id,
      baseWholesalePrice: 15000000, // 15 triệu thu mua Grade A
      baseRetailPrice: 18000000,    // 18 triệu bán Grade A
    },
  })

  // Create Product Specs (static specifications)
  await prisma.productSpec.createMany({
    data: [
      // iPhone 15 Pro specs
      { productTemplateId: iPhone15Pro.id, attributeId: ramAttribute.id, value: 8 },
      { productTemplateId: iPhone15Pro.id, attributeId: storageAttribute.id, value: '256' },

      // Samsung S23 specs
      { productTemplateId: samsungS23.id, attributeId: ramAttribute.id, value: 8 },
      { productTemplateId: samsungS23.id, attributeId: storageAttribute.id, value: '256' },
    ],
  })

  // Create Warehouse
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      code: 'WH-MAIN',
      name: 'Kho chính Celebi',
      address: 'Số 123 Nguyễn Trãi, Hà Nội',
      phone: '024-1234-5678',
      totalArea: 500.0, // 500m2
      maxCapacity: 1000, // 1000 sản phẩm
    },
  })

  // Create Bin Locations
  const phoneShelf = await prisma.binLocation.create({
    data: {
      warehouseId: mainWarehouse.id,
      code: 'A-1-01',
      name: 'Kệ A Tầng 1 Vị trí 01',
      type: 'SHELF',
      maxItems: 50,
    },
  })

  const qcArea = await prisma.binLocation.create({
    data: {
      warehouseId: mainWarehouse.id,
      code: 'QC-01',
      name: 'Khu thẩm định 01',
      type: 'QC_AREA',
      maxItems: 20,
    },
  })

  // Create QC Template for Smartphones
  const smartphoneQCTemplate = await prisma.qCTemplate.create({
    data: {
      categoryId: smartphoneCategory.id,
      name: 'Checklist thẩm định điện thoại',
      description: 'Form kiểm tra chất lượng cho điện thoại cũ',
      version: '1.0',
    },
  })

  // Create QC Check Items
  await prisma.qCCheckItem.createMany({
    data: [
      {
        templateId: smartphoneQCTemplate.id,
        section: 'Ngoại quan',
        item: 'Màn hình không trầy xước',
        type: 'VISUAL_CHECK',
        description: 'Kiểm tra các vết trầy, vết nứt trên màn hình',
        isRequired: true,
        maxScore: 100,
        gradingImpact: 3.0, // Ảnh hưởng lớn đến grade
        sortOrder: 1,
      },
      {
        templateId: smartphoneQCTemplate.id,
        section: 'Ngoại quan',
        item: 'Viền và lưng máy',
        type: 'VISUAL_CHECK',
        description: 'Kiểm tra cấn móp, trầy xước viền và mặt lưng',
        isRequired: true,
        maxScore: 100,
        gradingImpact: 2.0,
        sortOrder: 2,
      },
      {
        templateId: smartphoneQCTemplate.id,
        section: 'Chức năng',
        item: 'Kiểm tra độ chai pin',
        type: 'MEASUREMENT',
        description: 'Đo % pin hiện tại thông qua Settings > Battery Health',
        isRequired: true,
        maxScore: 100,
        gradingImpact: 2.5,
        sortOrder: 3,
      },
      {
        templateId: smartphoneQCTemplate.id,
        section: 'Chức năng',
        item: 'Face ID / Touch ID',
        type: 'FUNCTION_TEST',
        description: 'Test chức năng nhận diện khuôn mặt/vân tay',
        isRequired: true,
        maxScore: 100,
        gradingImpact: 2.0,
        sortOrder: 4,
      },
      {
        templateId: smartphoneQCTemplate.id,
        section: 'Phụ kiện',
        item: 'Hộp và phụ kiện đi kèm',
        type: 'ACCESSORY_COUNT',
        description: 'Kiểm tra hộp, cáp sạc, adapter, tai nghe (nếu có)',
        isRequired: false,
        maxScore: 100,
        gradingImpact: 1.0, // Ảnh hưởng nhỏ
        sortOrder: 5,
      },
    ],
  })

  // Create Serial Items (actual products in inventory) 
  const iphone1 = await prisma.serialItem.create({
    data: {
      productTemplateId: iPhone15Pro.id,
      serialNumber: '359123456789012', // IMEI
      internalCode: 'CEL-IP15P-0001',   // Internal barcode
      source: 'TGDD Trade-in',
      purchasePrice: 21000000, // 21 triệu (hơi thấp vì Grade B)
      purchaseDate: new Date('2024-02-15'),
      purchaseBatch: 'BATCH-2024-02-001',
      status: 'QC_IN_PROGRESS',
      warehouseId: mainWarehouse.id,
      binLocation: 'QC-01',
    },
  })

  const iphone2 = await prisma.serialItem.create({
    data: {
      productTemplateId: iPhone15Pro.id,
      serialNumber: '359123456789013',
      internalCode: 'CEL-IP15P-0002',
      source: 'FPT Shop',
      purchasePrice: 22000000, // Full price (Grade A)
      purchaseDate: new Date('2024-02-16'),
      purchaseBatch: 'BATCH-2024-02-002',
      status: 'AVAILABLE',
      grade: 'GRADE_A',
      conditionNotes: 'Máy như mới, không trầy xước',
      currentCostPrice: 22000000,
      suggestedPrice: 26000000,
      warehouseId: mainWarehouse.id,
      binLocation: 'A-1-01',
    },
  })

  const samsung1 = await prisma.serialItem.create({
    data: {
      productTemplateId: samsungS23.id,
      serialNumber: '351234567890123',
      internalCode: 'CEL-SAM-0001',
      source: 'Khách hàng trade-in',
      purchasePrice: 14000000, // 14 triệu (Grade B+)
      purchaseDate: new Date('2024-02-17'),
      purchaseBatch: 'BATCH-2024-02-003',
      status: 'AVAILABLE',
      grade: 'GRADE_B_PLUS',
      conditionNotes: 'Máy đẹp, pin chai 85%',
      currentCostPrice: 14000000,
      suggestedPrice: 17000000,
      warehouseId: mainWarehouse.id,
      binLocation: 'A-1-01',
    },
  })

  // Create Dynamic Specs (current condition of serial items)
  await prisma.dynamicSpec.createMany({
    data: [
      // iPhone 1 battery health
      {
        serialItemId: iphone1.id,
        attributeId: batteryHealthAttribute.id,
        value: 89, // 89% battery health
        recordedAt: new Date(),
        recordedById: qcInspector.id,
      },
      // iPhone 2 battery health
      {
        serialItemId: iphone2.id,
        attributeId: batteryHealthAttribute.id,
        value: 95, // 95% battery health
        recordedAt: new Date(),
      },
      // Samsung 1 battery health
      {
        serialItemId: samsung1.id,
        attributeId: batteryHealthAttribute.id,
        value: 85, // 85% battery health
        recordedAt: new Date(),
      },
    ],
  })

  // Create QC Inspection for iPhone1 (in progress)
  const qcInspection1 = await prisma.qCInspection.create({
    data: {
      serialItemId: iphone1.id,
      templateId: smartphoneQCTemplate.id,
      inspectorId: qcInspector.id,
      status: 'PENDING',
      startedAt: new Date(),
    },
  })

  // Create some transaction history
  await prisma.serialTransaction.createMany({
    data: [
      // iPhone 1 received
      {
        serialItemId: iphone1.id,
        type: 'INBOUND',
        fromLocation: 'External',
        toLocation: 'QC-01',
        fromStatus: null,
        toStatus: 'INCOMING',
        performedById: admin.id,
        notes: 'Nhận từ TGDD Trade-in program',
        createdAt: new Date('2024-02-15T10:00:00'),
      },
      // iPhone 1 moved to QC
      {
        serialItemId: iphone1.id,
        type: 'QC_START',
        fromLocation: 'QC-01',
        toLocation: 'QC-01',
        fromStatus: 'INCOMING',
        toStatus: 'QC_IN_PROGRESS',
        performedById: qcInspector.id,
        notes: 'Bắt đầu thẩm định chất lượng',
        createdAt: new Date('2024-02-15T14:00:00'),
      },
      // iPhone 2 - completed workflow
      {
        serialItemId: iphone2.id,
        type: 'INBOUND',
        fromLocation: 'External',
        toLocation: 'QC-01',
        fromStatus: null,
        toStatus: 'INCOMING',
        performedById: admin.id,
        notes: 'Nhận từ FPT Shop',
        createdAt: new Date('2024-02-16T09:00:00'),
      },
      {
        serialItemId: iphone2.id,
        type: 'QC_COMPLETE',
        fromLocation: 'QC-01',
        toLocation: 'A-1-01',
        fromStatus: 'QC_IN_PROGRESS',
        toStatus: 'AVAILABLE',
        performedById: qcInspector.id,
        notes: 'QC hoàn thành - Grade A',
        createdAt: new Date('2024-02-16T15:30:00'),
      },
    ],
  })

  // Create a sample customer
  const customer = await prisma.customer.create({
    data: {
      code: 'CUS-001',
      fullName: 'Nguyễn Văn Khách',
      phone: '0987654321',
      email: 'khach@email.com',
      address: 'Số 456 Lê Lợi, Hà Nội',
    },
  })

  // ===========================
  // SALES ORDER TEST DATA ⭐ NEW
  // ===========================

  const salesOrder1 = await prisma.salesOrder.create({
    data: {
      code: 'SO-202403-001',
      customerId: customer.id,
      warehouseId: mainWarehouse.id,
      salesPersonId: cashier.id,
      status: 'COMPLETED',
      totalAmount: 26000000,
      paidAmount: 26000000,
      notes: 'Khách hàng thân thiết',
      items: {
        create: [
          {
            serialItemId: iphone2.id,
            unitPrice: 26000000,
            discount: 0,
            finalPrice: 26000000,
          }
        ]
      }
    }
  })

  // Cập nhật trạng thái serialItem sau khi bán
  await prisma.serialItem.update({
    where: { id: iphone2.id },
    data: { status: 'SOLD' }
  })

  // Log transaction cho việc bán máy
  await prisma.serialTransaction.create({
    data: {
      serialItemId: iphone2.id,
      type: 'SOLD',
      fromLocation: 'A-1-01',
      toLocation: 'Customer',
      fromStatus: 'AVAILABLE',
      toStatus: 'SOLD',
      performedById: cashier.id,
      notes: 'Bán hàng cho khách ' + customer.fullName,
      createdAt: new Date('2024-03-02T10:00:00')
    }
  })

  // ===========================
  // OUTBOUND TEST DATA ⭐ NEW
  // ===========================

  // ===========================
  // INBOUND & TRADE-IN TEST DATA ⭐ NEW
  // ===========================

  console.log('📦 Seeding Inbound & Trade-In data...')

  // 1. Create Xiaomi Suppliers (needed for frontend filter)
  const storeTanPhu = await prisma.supplier.create({
    data: {
      code: 'XIAOMI-TP',
      name: 'Xiaomi Store - Tân Phú',
      contactPerson: 'Anh Minh',
      phone: '0901234567',
      address: 'Aeon Mall Tân Phú, TP.HCM',
    }
  })

  const storeQuan7 = await prisma.supplier.create({
    data: {
      code: 'XIAOMI-Q7',
      name: 'Xiaomi Store - Quận 7',
      contactPerson: 'Chị Lan',
      phone: '0909876543',
      address: 'Lotte Mart Quận 7, TP.HCM',
    }
  })

  // 2. Create Inbound Requests (Trade-In)
  const tradeIn1 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-TR-001',
      warehouseId: mainWarehouse.id,
      status: 'REQUESTED',
      supplierType: 'CUSTOMER_TRADE_IN',
      supplierName: 'Xiaomi Store - Tân Phú',
      supplierPhone: '0901234567',
      expectedDate: new Date(),
      totalEstimatedValue: 15000000,
      notes: 'Lô hàng trade-in ngày 05/03',
      items: {
        create: [
          {
            categoryId: smartphoneCategory.id,
            brandId: apple.id,
            modelName: 'iPhone 13 Pro 128GB',
            serialNumber: 'IMEI-123456',
            estimatedValue: 12000000,
            sourceCustomerName: 'Nguyễn Văn A',
            sourceCustomerPhone: '0911222333',
            employeeName: 'Nhân viên Xiaomi TP',
          },
          {
            categoryId: smartphoneCategory.id,
            brandId: samsung.id,
            modelName: 'Galaxy S21 Ultra',
            serialNumber: 'IMEI-789012',
            estimatedValue: 3000000,
            sourceCustomerName: 'Trần Thị B',
            sourceCustomerPhone: '0922333444',
            employeeName: 'Nhân viên Xiaomi TP',
          }
        ]
      }
    }
  })

  const tradeIn2 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-TR-002',
      warehouseId: mainWarehouse.id,
      status: 'IN_PROGRESS',
      supplierType: 'CUSTOMER_TRADE_IN',
      supplierName: 'Xiaomi Store - Quận 7',
      supplierPhone: '0909876543',
      receivedDate: new Date(),
      receivedById: admin.id,
      totalEstimatedValue: 25000000,
      notes: 'Máy trade-in từ khách VIP',
      items: {
        create: [
          {
            categoryId: smartphoneCategory.id,
            brandId: apple.id,
            modelName: 'iPhone 14 Pro Max 256GB',
            serialNumber: 'IMEI-555666',
            estimatedValue: 25000000,
            sourceCustomerName: 'Lê Văn C',
            sourceCustomerPhone: '0933444555',
            employeeName: 'Nhân viên Xiaomi Q7',
            isReceived: true,
            receivedAt: new Date(),
          }
        ]
      }
    }
  })

  const tradeIn3 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-TR-003',
      warehouseId: mainWarehouse.id,
      status: 'COMPLETED',
      supplierType: 'CUSTOMER_TRADE_IN',
      supplierName: 'Xiaomi Store - Tân Phú',
      receivedDate: new Date(Date.now() - 86400000),
      receivedById: admin.id,
      totalEstimatedValue: 10000000,
      totalActualValue: 10000000,
      items: {
        create: [
          {
            categoryId: smartphoneCategory.id,
            brandId: samsung.id,
            modelName: 'Galaxy Z Fold 4',
            serialNumber: 'IMEI-999888',
            estimatedValue: 10000000,
            sourceCustomerName: 'Hoàng Văn D',
            employeeName: 'Nhân viên Xiaomi TP',
            isReceived: true,
            receivedAt: new Date(Date.now() - 86400000),
          }
        ]
      }
    }
  })

  console.log('✅ Seeding completed!')
  console.log(`
📄 Summary:
- Users: 3 (Admin, QC Inspector, Technician)
- Categories: 3 (Smartphone, Laptop, TV)
- Brands: 3 (Apple, Samsung, LG)
- Product Templates: 2 (iPhone 15 Pro, Samsung S23)
- Serial Items: 3 (2 iPhones, 1 Samsung)
- QC Template: 1 with 5 check items
- Warehouse: 1 with 2 bin locations
- Transactions: 4 movement records
- Trade-In Requests: 3
- Trade-In Items: 4

🔧 Ready for Serial-Based Second-Hand Operations!
`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })