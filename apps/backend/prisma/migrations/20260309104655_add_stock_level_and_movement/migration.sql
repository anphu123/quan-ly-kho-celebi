/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `loyaltyPoints` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `membershipTier` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `totalSpent` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sales_order_items` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `sales_order_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `sales_order_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `sales_order_items` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `sales_order_items` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `sales_order_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `orderDate` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `sales_orders` table. All the data in the column will be lost.
  - The `status` column on the `sales_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `productId` on the `stock_levels` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `stock_levels` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `stock_levels` table. All the data in the column will be lost.
  - You are about to drop the column `fromWarehouseId` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `runningBalance` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `toWarehouseId` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the `accounts_payable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts_receivable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `barcodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goods_receipt_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goods_receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_units` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_adjustments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stocktakes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `units_of_measure` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[salesOrderId,serialItemId]` on the table `sales_order_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productTemplateId,warehouseId,grade]` on the table `stock_levels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productType` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalPrice` to the `sales_order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialItemId` to the `sales_order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `averageCost` to the `stock_levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `stock_levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productTemplateId` to the `stock_levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalValue` to the `stock_levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balanceAfter` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balanceBefore` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productTemplateId` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalValue` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `stock_movements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `unitCost` on table `stock_movements` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('ELECTRONICS', 'APPLIANCE_LARGE', 'APPLIANCE_SMALL', 'COMPUTER', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "TrackingMethod" AS ENUM ('SERIAL_BASED', 'QUANTITY_BASED');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'DECIMAL', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'DATE');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('INCOMING', 'QC_IN_PROGRESS', 'AVAILABLE', 'RESERVED', 'SOLD', 'REFURBISHING', 'DAMAGED', 'RETURNED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('GRADE_A_NEW', 'GRADE_A', 'GRADE_B_PLUS', 'GRADE_B', 'GRADE_C_PLUS', 'GRADE_C', 'GRADE_D');

-- CreateEnum
CREATE TYPE "CheckItemType" AS ENUM ('VISUAL_CHECK', 'FUNCTION_TEST', 'MEASUREMENT', 'ACCESSORY_COUNT');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('SHELF', 'FLOOR', 'CABINET', 'REPAIR', 'QC_AREA');

-- CreateEnum
CREATE TYPE "RefurbStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INBOUND', 'QC_START', 'QC_COMPLETE', 'MOVE_TO_REFURB', 'REFURB_COMPLETE', 'MOVE_TO_SALE', 'RESERVED', 'SOLD', 'RETURNED', 'DISPOSAL');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InboundStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('CUSTOMER_TRADE_IN', 'INTERNAL_RETURN', 'LIQUIDATION', 'INDIVIDUAL_SELLER');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT', 'RESERVE', 'UNRESERVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'QC_INSPECTOR';
ALTER TYPE "UserRole" ADD VALUE 'TECHNICIAN';

-- DropForeignKey
ALTER TABLE "accounts_payable" DROP CONSTRAINT "accounts_payable_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "accounts_receivable" DROP CONSTRAINT "accounts_receivable_customerId_fkey";

-- DropForeignKey
ALTER TABLE "barcodes" DROP CONSTRAINT "barcodes_productId_fkey";

-- DropForeignKey
ALTER TABLE "cash_entries" DROP CONSTRAINT "cash_entries_createdById_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "goods_receipt_items_goodsReceiptId_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "goods_receipt_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "goods_receipt_items_unitId_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipts" DROP CONSTRAINT "goods_receipts_createdById_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipts" DROP CONSTRAINT "goods_receipts_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipts" DROP CONSTRAINT "goods_receipts_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_salesOrderId_fkey";

-- DropForeignKey
ALTER TABLE "product_units" DROP CONSTRAINT "product_units_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_units" DROP CONSTRAINT "product_units_unitId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_baseUnitId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_brandId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_unitId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_createdById_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_unitId_fkey";

-- DropForeignKey
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_createdById_fkey";

-- DropForeignKey
ALTER TABLE "stock_adjustments" DROP CONSTRAINT "stock_adjustments_createdById_fkey";

-- DropForeignKey
ALTER TABLE "stock_adjustments" DROP CONSTRAINT "stock_adjustments_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_adjustments" DROP CONSTRAINT "stock_adjustments_stocktakeId_fkey";

-- DropForeignKey
ALTER TABLE "stock_levels" DROP CONSTRAINT "stock_levels_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_levels" DROP CONSTRAINT "stock_levels_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_fromWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_toWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "stocktakes" DROP CONSTRAINT "stocktakes_createdById_fkey";

-- DropForeignKey
ALTER TABLE "stocktakes" DROP CONSTRAINT "stocktakes_warehouseId_fkey";

-- DropIndex
DROP INDEX "customers_phone_key";

-- DropIndex
DROP INDEX "stock_levels_productId_warehouseId_key";

-- DropIndex
DROP INDEX "stock_movements_productId_warehouseId_createdAt_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "productType" "ProductType" NOT NULL,
ADD COLUMN     "trackingMethod" "TrackingMethod" NOT NULL DEFAULT 'SERIAL_BASED';

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "dateOfBirth",
DROP COLUMN "isActive",
DROP COLUMN "loyaltyPoints",
DROP COLUMN "membershipTier",
DROP COLUMN "totalSpent";

-- AlterTable
ALTER TABLE "sales_order_items" DROP COLUMN "createdAt",
DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "totalPrice",
DROP COLUMN "unitCost",
DROP COLUMN "unitId",
ADD COLUMN     "finalPrice" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "serialItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales_orders" DROP COLUMN "createdById",
DROP COLUMN "discountAmount",
DROP COLUMN "isPaid",
DROP COLUMN "orderDate",
DROP COLUMN "paymentMethod",
DROP COLUMN "subtotal",
DROP COLUMN "taxAmount",
ADD COLUMN     "salesPersonId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "totalAmount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "stock_levels" DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "updatedAt",
ADD COLUMN     "availableQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "averageCost" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "damagedQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "grade" "Grade",
ADD COLUMN     "incomingQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "maxStockLevel" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "minStockLevel" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "physicalQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productTemplateId" TEXT NOT NULL,
ADD COLUMN     "qcInProgressQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refurbishingQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reorderPoint" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "reservedQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "returnedQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalValue" DECIMAL(15,2) NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "fromWarehouseId",
DROP COLUMN "productId",
DROP COLUMN "runningBalance",
DROP COLUMN "toWarehouseId",
ADD COLUMN     "balanceAfter" INTEGER NOT NULL,
ADD COLUMN     "balanceBefore" INTEGER NOT NULL,
ADD COLUMN     "productTemplateId" TEXT NOT NULL,
ADD COLUMN     "serialItemId" TEXT,
ADD COLUMN     "totalValue" DECIMAL(15,2) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "MovementType" NOT NULL,
ALTER COLUMN "unitCost" SET NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "maxCapacity" INTEGER,
ADD COLUMN     "totalArea" DECIMAL(10,2);

-- DropTable
DROP TABLE "accounts_payable";

-- DropTable
DROP TABLE "accounts_receivable";

-- DropTable
DROP TABLE "barcodes";

-- DropTable
DROP TABLE "cash_entries";

-- DropTable
DROP TABLE "goods_receipt_items";

-- DropTable
DROP TABLE "goods_receipts";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "product_units";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "purchase_order_items";

-- DropTable
DROP TABLE "purchase_orders";

-- DropTable
DROP TABLE "stock_adjustments";

-- DropTable
DROP TABLE "stocktakes";

-- DropTable
DROP TABLE "units_of_measure";

-- DropEnum
DROP TYPE "CashEntryType";

-- DropEnum
DROP TYPE "DebtStatus";

-- DropEnum
DROP TYPE "GRStatus";

-- DropEnum
DROP TYPE "MembershipTier";

-- DropEnum
DROP TYPE "POStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "SOStatus";

-- DropEnum
DROP TYPE "StockMovementType";

-- DropEnum
DROP TYPE "StocktakeStatus";

-- CreateTable
CREATE TABLE "product_templates" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "baseWholesalePrice" DECIMAL(15,2),
    "baseRetailPrice" DECIMAL(15,2),
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_groups" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" TEXT NOT NULL,
    "attributeGroupId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "minValue" DECIMAL(65,30),
    "maxValue" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specs" (
    "id" TEXT NOT NULL,
    "productTemplateId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "product_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_items" (
    "id" TEXT NOT NULL,
    "productTemplateId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "internalCode" TEXT NOT NULL,
    "source" TEXT,
    "purchasePrice" DECIMAL(15,2) NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchaseBatch" TEXT,
    "status" "SerialStatus" NOT NULL DEFAULT 'INCOMING',
    "grade" "Grade",
    "conditionNotes" TEXT,
    "currentCostPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "suggestedPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "warehouseId" TEXT NOT NULL,
    "binLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serial_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_specs" (
    "id" TEXT NOT NULL,
    "serialItemId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,

    CONSTRAINT "dynamic_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_templates" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_check_items" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "type" "CheckItemType" NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "gradingImpact" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_check_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_inspections" (
    "id" TEXT NOT NULL,
    "serialItemId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "totalScore" DECIMAL(5,2),
    "suggestedGrade" "Grade",
    "finalGrade" "Grade",
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "qc_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_inspection_items" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "checkItemId" TEXT NOT NULL,
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "photos" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qc_inspection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bin_locations" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'SHELF',
    "maxItems" INTEGER,
    "maxWeight" DECIMAL(10,2),
    "currentItems" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bin_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refurbishment_jobs" (
    "id" TEXT NOT NULL,
    "serialItemId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "status" "RefurbStatus" NOT NULL DEFAULT 'PLANNED',
    "issuesFound" TEXT NOT NULL,
    "plannedWork" TEXT NOT NULL,
    "estimatedCost" DECIMAL(15,2) NOT NULL,
    "actualWork" TEXT,
    "actualCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refurbishment_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_usages" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCost" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "part_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_transactions" (
    "id" TEXT NOT NULL,
    "serialItemId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "fromStatus" "SerialStatus",
    "toStatus" "SerialStatus",
    "costChange" DECIMAL(15,2),
    "notes" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_requests" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "InboundStatus" NOT NULL DEFAULT 'REQUESTED',
    "supplierType" "SupplierType" NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierPhone" TEXT,
    "supplierEmail" TEXT,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "totalEstimatedValue" DECIMAL(15,2),
    "totalActualValue" DECIMAL(15,2),
    "notes" TEXT,
    "receivedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_items" (
    "id" TEXT NOT NULL,
    "inboundRequestId" TEXT NOT NULL,
    "productTemplateId" TEXT,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "serialNumber" TEXT,
    "modelName" TEXT NOT NULL,
    "condition" TEXT,
    "estimatedValue" DECIMAL(15,2),
    "notes" TEXT,
    "sourceCustomerName" TEXT,
    "sourceCustomerPhone" TEXT,
    "sourceCustomerAddress" TEXT,
    "sourceCustomerIdCard" TEXT,
    "idCardIssueDate" TIMESTAMP(3),
    "idCardIssuePlace" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "contractNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "employeeName" TEXT,
    "otherCosts" DECIMAL(15,2),
    "topUp" DECIMAL(15,2),
    "repairCost" DECIMAL(15,2),
    "imageUrl" TEXT,
    "deviceImages" TEXT,
    "cccdFrontUrl" TEXT,
    "cccdBackUrl" TEXT,
    "isReceived" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3),
    "serialItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_templates_sku_key" ON "product_templates"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_attributeGroupId_key_key" ON "attributes"("attributeGroupId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "product_specs_productTemplateId_attributeId_key" ON "product_specs"("productTemplateId", "attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "serial_items_serialNumber_key" ON "serial_items"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "serial_items_internalCode_key" ON "serial_items"("internalCode");

-- CreateIndex
CREATE INDEX "dynamic_specs_serialItemId_attributeId_recordedAt_idx" ON "dynamic_specs"("serialItemId", "attributeId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "qc_inspection_items_inspectionId_checkItemId_key" ON "qc_inspection_items"("inspectionId", "checkItemId");

-- CreateIndex
CREATE UNIQUE INDEX "bin_locations_warehouseId_code_key" ON "bin_locations"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "serial_transactions_serialItemId_createdAt_idx" ON "serial_transactions"("serialItemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_requests_code_key" ON "inbound_requests"("code");

-- CreateIndex
CREATE INDEX "inbound_requests_status_expectedDate_idx" ON "inbound_requests"("status", "expectedDate");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_items_serialItemId_key" ON "inbound_items"("serialItemId");

-- CreateIndex
CREATE INDEX "inbound_items_inboundRequestId_isReceived_idx" ON "inbound_items"("inboundRequestId", "isReceived");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_items_salesOrderId_serialItemId_key" ON "sales_order_items"("salesOrderId", "serialItemId");

-- CreateIndex
CREATE INDEX "stock_levels_warehouseId_availableQty_idx" ON "stock_levels"("warehouseId", "availableQty");

-- CreateIndex
CREATE INDEX "stock_levels_productTemplateId_physicalQty_idx" ON "stock_levels"("productTemplateId", "physicalQty");

-- CreateIndex
CREATE UNIQUE INDEX "stock_levels_productTemplateId_warehouseId_grade_key" ON "stock_levels"("productTemplateId", "warehouseId", "grade");

-- CreateIndex
CREATE INDEX "stock_movements_productTemplateId_warehouseId_createdAt_idx" ON "stock_movements"("productTemplateId", "warehouseId", "createdAt");

-- CreateIndex
CREATE INDEX "stock_movements_referenceType_referenceId_idx" ON "stock_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "stock_movements_serialItemId_idx" ON "stock_movements"("serialItemId");

-- AddForeignKey
ALTER TABLE "product_templates" ADD CONSTRAINT "product_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_templates" ADD CONSTRAINT "product_templates_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_groups" ADD CONSTRAINT "attribute_groups_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_attributeGroupId_fkey" FOREIGN KEY ("attributeGroupId") REFERENCES "attribute_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_productTemplateId_fkey" FOREIGN KEY ("productTemplateId") REFERENCES "product_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_items" ADD CONSTRAINT "serial_items_productTemplateId_fkey" FOREIGN KEY ("productTemplateId") REFERENCES "product_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_items" ADD CONSTRAINT "serial_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dynamic_specs" ADD CONSTRAINT "dynamic_specs_serialItemId_fkey" FOREIGN KEY ("serialItemId") REFERENCES "serial_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dynamic_specs" ADD CONSTRAINT "dynamic_specs_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_templates" ADD CONSTRAINT "qc_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_check_items" ADD CONSTRAINT "qc_check_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "qc_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_serialItemId_fkey" FOREIGN KEY ("serialItemId") REFERENCES "serial_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "qc_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspection_items" ADD CONSTRAINT "qc_inspection_items_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "qc_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_inspection_items" ADD CONSTRAINT "qc_inspection_items_checkItemId_fkey" FOREIGN KEY ("checkItemId") REFERENCES "qc_check_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bin_locations" ADD CONSTRAINT "bin_locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refurbishment_jobs" ADD CONSTRAINT "refurbishment_jobs_serialItemId_fkey" FOREIGN KEY ("serialItemId") REFERENCES "serial_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refurbishment_jobs" ADD CONSTRAINT "refurbishment_jobs_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_usages" ADD CONSTRAINT "part_usages_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "refurbishment_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_transactions" ADD CONSTRAINT "serial_transactions_serialItemId_fkey" FOREIGN KEY ("serialItemId") REFERENCES "serial_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_transactions" ADD CONSTRAINT "serial_transactions_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_serialItemId_fkey" FOREIGN KEY ("serialItemId") REFERENCES "serial_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_requests" ADD CONSTRAINT "inbound_requests_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_requests" ADD CONSTRAINT "inbound_requests_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_inboundRequestId_fkey" FOREIGN KEY ("inboundRequestId") REFERENCES "inbound_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_productTemplateId_fkey" FOREIGN KEY ("productTemplateId") REFERENCES "product_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_serialItemId_fkey" FOREIGN KEY ("serialItemId") REFERENCES "serial_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_productTemplateId_fkey" FOREIGN KEY ("productTemplateId") REFERENCES "product_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productTemplateId_fkey" FOREIGN KEY ("productTemplateId") REFERENCES "product_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
