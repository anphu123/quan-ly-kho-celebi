/*
  Warnings:

  - You are about to alter the column `minValue` on the `attributes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `maxValue` on the `attributes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `maxWeight` on the `bin_locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `estimatedValue` on the `inbound_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `otherCosts` on the `inbound_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `topUp` on the `inbound_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `repairCost` on the `inbound_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalEstimatedValue` on the `inbound_requests` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalActualValue` on the `inbound_requests` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `unitCost` on the `part_usages` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `baseWholesalePrice` on the `product_templates` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `baseRetailPrice` on the `product_templates` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `gradingImpact` on the `qc_check_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalScore` on the `qc_inspections` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `estimatedCost` on the `refurbishment_jobs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `actualCost` on the `refurbishment_jobs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `unitPrice` on the `sales_order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `discount` on the `sales_order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `finalPrice` on the `sales_order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalAmount` on the `sales_orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `paidAmount` on the `sales_orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to drop the column `binLocation` on the `serial_items` table. All the data in the column will be lost.
  - You are about to alter the column `purchasePrice` on the `serial_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `currentCostPrice` on the `serial_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `suggestedPrice` on the `serial_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `costChange` on the `serial_transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `averageCost` on the `stock_levels` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalValue` on the `stock_levels` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `unitCost` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalValue` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalArea` on the `warehouses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InboundStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "InboundStatus" ADD VALUE 'PENDING_WAREHOUSE_ENTRY';
ALTER TYPE "InboundStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_fkey";

-- DropIndex
DROP INDEX "inbound_items_serialItemId_key";

-- AlterTable
ALTER TABLE "attributes" ALTER COLUMN "minValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "maxValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "bin_locations" ALTER COLUMN "maxWeight" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "inbound_items" ADD COLUMN     "customData" TEXT,
ALTER COLUMN "estimatedValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "otherCosts" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "topUp" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "repairCost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "inbound_requests" ADD COLUMN     "tradeInProgramId" TEXT,
ALTER COLUMN "totalEstimatedValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalActualValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "part_usages" ALTER COLUMN "unitCost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "product_templates" ALTER COLUMN "baseWholesalePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "baseRetailPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "qc_check_items" ALTER COLUMN "gradingImpact" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "qc_inspections" ALTER COLUMN "totalScore" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "refurbishment_jobs" ALTER COLUMN "estimatedCost" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "actualCost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "sales_order_items" ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "finalPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "sales_orders" ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "paidAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "serial_items" DROP COLUMN "binLocation",
ADD COLUMN     "binLocationId" TEXT,
ALTER COLUMN "purchasePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "currentCostPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "suggestedPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "serial_transactions" ALTER COLUMN "costChange" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "stock_levels" ALTER COLUMN "averageCost" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "stock_movements" ALTER COLUMN "unitCost" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "managerId" TEXT,
ALTER COLUMN "totalArea" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "trade_in_programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "customFields" JSONB,
    "defaultFieldConfig" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_in_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trade_in_programs_code_key" ON "trade_in_programs"("code");

-- CreateIndex
CREATE INDEX "inbound_requests_tradeInProgramId_idx" ON "inbound_requests"("tradeInProgramId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "serial_items" ADD CONSTRAINT "serial_items_binLocationId_fkey" FOREIGN KEY ("binLocationId") REFERENCES "bin_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_in_programs" ADD CONSTRAINT "trade_in_programs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_requests" ADD CONSTRAINT "inbound_requests_tradeInProgramId_fkey" FOREIGN KEY ("tradeInProgramId") REFERENCES "trade_in_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
