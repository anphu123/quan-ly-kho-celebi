-- CreateTable: FormTemplate
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FormField
CREATE TABLE "form_fields" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL DEFAULT 'TEXT',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FormSubmission
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FormFieldValue
CREATE TABLE "form_field_values" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    CONSTRAINT "form_field_values_pkey" PRIMARY KEY ("id")
);

-- AddColumn: formTemplateId to trade_in_programs
ALTER TABLE "trade_in_programs" ADD COLUMN "formTemplateId" TEXT;

-- AddColumn: formSubmissionId to inbound_items
ALTER TABLE "inbound_items" ADD COLUMN "formSubmissionId" TEXT;

-- Unique constraints
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_templateId_key_key" UNIQUE ("templateId", "key");
ALTER TABLE "form_field_values" ADD CONSTRAINT "form_field_values_submissionId_fieldKey_key" UNIQUE ("submissionId", "fieldKey");
ALTER TABLE "trade_in_programs" ADD CONSTRAINT "trade_in_programs_formTemplateId_key" UNIQUE ("formTemplateId");

-- Indexes
CREATE INDEX "form_submissions_referenceType_referenceId_idx" ON "form_submissions"("referenceType", "referenceId");

-- ForeignKeys
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "form_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "form_field_values" ADD CONSTRAINT "form_field_values_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trade_in_programs" ADD CONSTRAINT "trade_in_programs_formTemplateId_fkey"
    FOREIGN KEY ("formTemplateId") REFERENCES "form_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate: tạo FormTemplate từ TradeInProgram có customFields không rỗng
INSERT INTO "form_templates" ("id", "name", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    'Form - ' || name,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "trade_in_programs"
WHERE "customFields" IS NOT NULL
  AND jsonb_array_length("customFields"::jsonb) > 0;

-- Link trade_in_programs -> form_templates
UPDATE "trade_in_programs" tp
SET "formTemplateId" = ft.id
FROM "form_templates" ft
WHERE ft.name = 'Form - ' || tp.name
  AND tp."customFields" IS NOT NULL
  AND jsonb_array_length(tp."customFields"::jsonb) > 0;

-- Migrate FormFields từ customFields JSON array
INSERT INTO "form_fields" ("id", "templateId", "key", "label", "type", "isRequired", "isVisible", "sortOrder")
SELECT
    gen_random_uuid()::text,
    tp."formTemplateId",
    f->>'key',
    f->>'label',
    UPPER(COALESCE(f->>'type', 'TEXT'))::"AttributeType",
    COALESCE((f->>'required')::boolean, false),
    true,
    (row_number() OVER (PARTITION BY tp.id ORDER BY ordinality))::int - 1
FROM "trade_in_programs" tp,
     jsonb_array_elements(tp."customFields"::jsonb) WITH ORDINALITY AS t(f, ordinality)
WHERE tp."formTemplateId" IS NOT NULL;
