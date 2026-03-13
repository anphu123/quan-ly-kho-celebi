-- CreateTable
CREATE TABLE "brand_categories" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_categories_brandId_categoryId_key" ON "brand_categories"("brandId", "categoryId");

-- CreateIndex
CREATE INDEX "brand_categories_categoryId_idx" ON "brand_categories"("categoryId");

-- CreateIndex
CREATE INDEX "brand_categories_brandId_idx" ON "brand_categories"("brandId");

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
