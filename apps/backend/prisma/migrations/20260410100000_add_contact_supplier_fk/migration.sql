-- CreateTable: Contact model
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "idCard" TEXT,
    "idCardIssueDate" TIMESTAMP(3),
    "idCardIssuePlace" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- AddColumn: contactId to inbound_items
ALTER TABLE "inbound_items" ADD COLUMN "contactId" TEXT;

-- AddColumn: contactId + supplierId to inbound_requests
ALTER TABLE "inbound_requests" ADD COLUMN "contactId" TEXT;
ALTER TABLE "inbound_requests" ADD COLUMN "supplierId" TEXT;

-- AddForeignKey: inbound_items -> contacts
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: inbound_requests -> contacts
ALTER TABLE "inbound_requests" ADD CONSTRAINT "inbound_requests_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: inbound_requests -> suppliers
ALTER TABLE "inbound_requests" ADD CONSTRAINT "inbound_requests_supplierId_fkey"
    FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing data: tạo Contact từ flat fields trong inbound_items
INSERT INTO "contacts" ("id", "fullName", "phone", "email", "address", "idCard", "idCardIssueDate", "idCardIssuePlace", "bankAccount", "bankName", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    COALESCE("sourceCustomerName", 'Unknown'),
    "sourceCustomerPhone",
    NULL,
    "sourceCustomerAddress",
    "sourceCustomerIdCard",
    "idCardIssueDate",
    "idCardIssuePlace",
    "bankAccount",
    "bankName",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "inbound_items"
WHERE "sourceCustomerName" IS NOT NULL AND "sourceCustomerName" != '';

-- Link inbound_items -> contacts
UPDATE "inbound_items" ii
SET "contactId" = c.id
FROM "contacts" c
WHERE ii."sourceCustomerName" IS NOT NULL
  AND ii."sourceCustomerName" != ''
  AND c."fullName" = ii."sourceCustomerName"
  AND (c."phone" = ii."sourceCustomerPhone" OR (c."phone" IS NULL AND ii."sourceCustomerPhone" IS NULL));
