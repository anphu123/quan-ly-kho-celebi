/**
 * MongoDB Seed Script
 * Sync dữ liệu từ PostgreSQL → MongoDB (backup)
 */
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// ─── Mongoose Schemas ────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({ _pgId: String, email: String, fullName: String, role: String, isActive: Boolean, createdAt: Date }, { collection: 'users' });
const WarehouseSchema = new mongoose.Schema({ _pgId: String, code: String, name: String, address: String, isActive: Boolean }, { collection: 'warehouses' });
const BrandSchema = new mongoose.Schema({ _pgId: String, name: String, code: String, logoUrl: String }, { collection: 'brands' });
const CategorySchema = new mongoose.Schema({ _pgId: String, name: String, code: String, productType: String }, { collection: 'categories' });
const SupplierSchema = new mongoose.Schema({ _pgId: String, name: String, code: String, phone: String, address: String }, { collection: 'suppliers' });
const CustomerSchema = new mongoose.Schema({ _pgId: String, fullName: String, phone: String, email: String, address: String }, { collection: 'customers' });
const ProductTemplateSchema = new mongoose.Schema({ _pgId: String, sku: String, name: String, category: String, brand: String, baseRetailPrice: Number, baseWholesalePrice: Number }, { collection: 'product_templates' });
const SerialItemSchema = new mongoose.Schema({ _pgId: String, internalCode: String, serialNumber: String, status: String, productTemplate: String, warehouse: String, createdAt: Date }, { collection: 'serial_items' });
const InboundSchema = new mongoose.Schema({ _pgId: String, code: String, status: String, warehouse: String, createdAt: Date, itemCount: Number }, { collection: 'inbound_requests' });
const SalesOrderSchema = new mongoose.Schema({ _pgId: String, code: String, status: String, totalAmount: Number, customer: String, createdAt: Date }, { collection: 'sales_orders' });

// ─── Models ──────────────────────────────────────────────────────────────────
const UserModel = mongoose.model('User', UserSchema);
const WarehouseModel = mongoose.model('Warehouse', WarehouseSchema);
const BrandModel = mongoose.model('Brand', BrandSchema);
const CategoryModel = mongoose.model('Category', CategorySchema);
const SupplierModel = mongoose.model('Supplier', SupplierSchema);
const CustomerModel = mongoose.model('Customer', CustomerSchema);
const ProductTemplateModel = mongoose.model('ProductTemplate', ProductTemplateSchema);
const SerialItemModel = mongoose.model('SerialItem', SerialItemSchema);
const InboundModel = mongoose.model('Inbound', InboundSchema);
const SalesOrderModel = mongoose.model('SalesOrder', SalesOrderSchema);

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/celebi_db';
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  // Drop existing backup collections
  console.log('🧹 Clearing old backup data...');
  await Promise.all([
    UserModel.deleteMany({}),
    WarehouseModel.deleteMany({}),
    BrandModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    SupplierModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    ProductTemplateModel.deleteMany({}),
    SerialItemModel.deleteMany({}),
    InboundModel.deleteMany({}),
    SalesOrderModel.deleteMany({}),
  ]);

  // ── Users ──
  const pgUsers = await prisma.user.findMany();
  await UserModel.insertMany(pgUsers.map(u => ({ _pgId: u.id, email: u.email, fullName: u.fullName, role: u.role, isActive: u.isActive, createdAt: u.createdAt })));
  console.log(`👤 Users: ${pgUsers.length}`);

  // ── Warehouses ──
  const pgWarehouses = await prisma.warehouse.findMany();
  await WarehouseModel.insertMany(pgWarehouses.map(w => ({ _pgId: w.id, code: w.code, name: w.name, address: w.address, isActive: w.isActive })));
  console.log(`🏭 Warehouses: ${pgWarehouses.length}`);

  // ── Brands ──
  const pgBrands = await prisma.brand.findMany();
  await BrandModel.insertMany(pgBrands.map(b => ({ _pgId: b.id, name: b.name, code: b.code, logoUrl: b.logo })));
  console.log(`🏷️  Brands: ${pgBrands.length}`);

  // ── Categories ──
  const pgCategories = await prisma.category.findMany();
  await CategoryModel.insertMany(pgCategories.map(c => ({ _pgId: c.id, name: c.name, code: c.code, productType: c.productType })));
  console.log(`📂 Categories: ${pgCategories.length}`);

  // ── Suppliers ──
  const pgSuppliers = await prisma.supplier.findMany();
  await SupplierModel.insertMany(pgSuppliers.map(s => ({ _pgId: s.id, name: s.name, code: s.code, phone: s.phone, address: s.address })));
  console.log(`🏪 Suppliers: ${pgSuppliers.length}`);

  // ── Customers ──
  const pgCustomers = await prisma.customer.findMany();
  await CustomerModel.insertMany(pgCustomers.map(c => ({ _pgId: c.id, fullName: c.fullName, phone: c.phone, email: c.email, address: c.address })));
  console.log(`👥 Customers: ${pgCustomers.length}`);

  // ── Product Templates ──
  const pgProducts = await prisma.productTemplate.findMany({ include: { category: true, brand: true } });
  await ProductTemplateModel.insertMany(pgProducts.map(p => ({ _pgId: p.id, sku: p.sku, name: p.name, category: p.category?.name, brand: p.brand?.name, baseRetailPrice: p.baseRetailPrice, baseWholesalePrice: p.baseWholesalePrice })));
  console.log(`📱 Product Templates: ${pgProducts.length}`);

  // ── Serial Items ──
  const pgSerials = await prisma.serialItem.findMany({ include: { productTemplate: true, warehouse: true } });
  await SerialItemModel.insertMany(pgSerials.map(s => ({ _pgId: s.id, internalCode: s.internalCode, serialNumber: s.serialNumber, status: s.status, productTemplate: s.productTemplate?.name, warehouse: s.warehouse?.name, createdAt: s.createdAt })));
  console.log(`🔖 Serial Items: ${pgSerials.length}`);

  // ── Inbound Requests ──
  const pgInbounds = await prisma.inboundRequest.findMany({ include: { warehouse: true, items: true } });
  await InboundModel.insertMany(pgInbounds.map(i => ({ _pgId: i.id, code: i.code, status: i.status, warehouse: i.warehouse?.name, createdAt: i.createdAt, itemCount: i.items.length })));
  console.log(`📦 Inbound Requests: ${pgInbounds.length}`);

  // ── Sales Orders ──
  const pgSales = await prisma.salesOrder.findMany({ include: { customer: true } });
  await SalesOrderModel.insertMany(pgSales.map(s => ({ _pgId: s.id, code: s.code, status: s.status, totalAmount: s.totalAmount, customer: s.customer?.fullName, createdAt: s.createdAt })));
  console.log(`🛒 Sales Orders: ${pgSales.length}`);

  const total = pgUsers.length + pgWarehouses.length + pgBrands.length + pgCategories.length + pgSuppliers.length + pgCustomers.length + pgProducts.length + pgSerials.length + pgInbounds.length + pgSales.length;
  console.log(`\n✅ Synced ${total} records PostgreSQL → MongoDB`);
  console.log(`🌐 Cloud: ${mongoUri.includes('mongodb+srv') ? 'Atlas ✅' : 'Local ✅'}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(async () => { await mongoose.disconnect(); await prisma.$disconnect(); });
