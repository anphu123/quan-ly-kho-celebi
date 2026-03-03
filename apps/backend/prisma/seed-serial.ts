import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding serial-based database...')

  // Clear existing data (in reverse dependency order)
  console.log('🧹 Clearing existing data...')
  await prisma.qCInspectionItem.deleteMany()
  await prisma.qCInspection.deleteMany()
  await prisma.serialTransaction.deleteMany()
  await prisma.dynamicSpec.deleteMany()
  await prisma.salesOrderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.refurbishmentJob.deleteMany()
  await prisma.serialItem.deleteMany()
  await prisma.qCCheckItem.deleteMany()
  await prisma.qCTemplate.deleteMany()
  await prisma.productSpec.deleteMany()
  await prisma.productTemplate.deleteMany()
  await prisma.binLocation.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.attribute.deleteMany()
  await prisma.attributeGroup.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

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
  // INBOUND TEST DATA ⭐ NEW
  // ===========================

  // Create sample inbound requests for testing
  const inboundRequest1 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-202403-001',
      warehouseId: mainWarehouse.id,
      status: 'REQUESTED',
      supplierType: 'CUSTOMER_TRADE_IN',
      supplierName: 'Nguyễn Văn Khách',
      supplierPhone: '0901234567',
      supplierEmail: 'khach.nguyen@email.com',
      expectedDate: new Date('2024-03-04'),
      totalEstimatedValue: 35000000, // 35 triệu
      notes: 'Khách hàng đổi cũ lấy mới iPhone và Samsung',
    },
  })

  const inboundRequest2 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-202403-002',
      warehouseId: mainWarehouse.id,
      status: 'IN_PROGRESS',
      supplierType: 'LIQUIDATION',
      supplierName: 'Công ty ABC Electronics',
      supplierPhone: '0246789123',
      supplierEmail: 'liquidation@abc-electronics.com',
      expectedDate: new Date('2024-03-03'),
      receivedDate: new Date(),
      totalEstimatedValue: 60000000, // 60 triệu
      notes: 'Thanh lý thiết bị công ty - lô hàng lớn',
      receivedById: admin.id,
    },
  })

  const inboundRequest3 = await prisma.inboundRequest.create({
    data: {
      code: 'INB-202403-003',
      warehouseId: mainWarehouse.id,
      status: 'COMPLETED',
      supplierType: 'INDIVIDUAL_SELLER',
      supplierName: 'Trần Thị Bán',
      supplierPhone: '0987654321',
      expectedDate: new Date('2024-03-01'),
      receivedDate: new Date('2024-03-01'),
      totalEstimatedValue: 15000000, // 15 triệu
      totalActualValue: 14000000,   // 14 triệu thực tế
      notes: 'Nhận Samsung cũ từ cá nhân',
      receivedById: admin.id,
    },
  })

  // Create inbound items
  await prisma.inboundItem.createMany({
    data: [
      // Request 1 items (REQUESTED)
      {
        inboundRequestId: inboundRequest1.id,
        categoryId: smartphoneCategory.id,
        brandId: apple.id,
        modelName: 'iPhone 14 Pro 128GB',
        serialNumber: '359987654321098',
        condition: 'Tốt',
        estimatedValue: 20000000,
        notes: 'Máy đẹp, có hộp',
        isReceived: false,
      },
      {
        inboundRequestId: inboundRequest1.id,
        categoryId: smartphoneCategory.id,
        brandId: samsung.id,
        modelName: 'Samsung Galaxy S22 Ultra 256GB',
        condition: 'Khá',
        estimatedValue: 15000000,
        notes: 'Máy sử dụng ít, nhỏ trầy',
        isReceived: false,
      },
      
      // Request 2 items (IN_PROGRESS)
      {
        inboundRequestId: inboundRequest2.id,
        categoryId: smartphoneCategory.id,
        brandId: apple.id,
        modelName: 'iPhone 13 Pro Max 256GB',
        serialNumber: '359111222333444',
        condition: 'Tốt',
        estimatedValue: 18000000,
        notes: 'Máy công ty, ít sử dụng',
        isReceived: false,
      },
      {
        inboundRequestId: inboundRequest2.id,
        categoryId: smartphoneCategory.id,
        brandId: samsung.id,
        modelName: 'Samsung Galaxy Note 20 Ultra',
        condition: 'Khá',
        estimatedValue: 12000000,
        notes: 'Pin chai nhẹ',
        isReceived: false,
      },
      {
        inboundRequestId: inboundRequest2.id,
        categoryId: laptopCategory.id,
        brandId: apple.id,
        modelName: 'MacBook Pro 14" M1 Pro 512GB',
        condition: 'Tốt',
        estimatedValue: 30000000,
        notes: 'Laptop công ty, còn bảo hành',
        isReceived: false,
      },
      
      // Request 3 items (COMPLETED - linked to existing serial item)
      {
        inboundRequestId: inboundRequest3.id,
        categoryId: smartphoneCategory.id,
        brandId: samsung.id,
        productTemplateId: samsungS23.id,
        modelName: 'Samsung Galaxy S23 256GB',
        serialNumber: '351234567890123', // Same as samsung1 serial item
        condition: 'Khá',
        estimatedValue: 15000000,
        notes: 'Pin 85%, máy đẹp',
        isReceived: true,
        receivedAt: new Date('2024-03-01T14:30:00'),
        serialItemId: samsung1.id, // Link to created serial item
      },
    ],
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
- Inbound Requests: 3 (1 Requested, 1 In Progress, 1 Completed)
- Inbound Items: 6 (5 pending, 1 received)

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