-- CreateEnum
CREATE TYPE "ApplicableEntityTypeId" AS ENUM ('Company', 'PE', 'Partnership', 'TrustFoundation', 'Other');

-- CreateEnum
CREATE TYPE "EnglishAcceptedId" AS ENUM ('FullyAccepted', 'PartlyAccepted', 'AcceptedWithTranslationRequired', 'NotAccepted', 'NotApplicable');

-- CreateEnum
CREATE TYPE "FilingResponsibilityId" AS ENUM ('LocalEntity', 'HeadOfTaxGroup', 'FilingConstituentEntity', 'UltimateParentEntity');

-- CreateEnum
CREATE TYPE "IsObligationInPlaceId" AS ENUM ('InPlace', 'NotEnforced', 'NotExist');

-- CreateEnum
CREATE TYPE "ObligationTypeId" AS ENUM ('CIT', 'MasterFile', 'LocalFile', 'AnnualTPForm', 'CbCR', 'PublicCbCR', 'CbCRNotification', 'GIR', 'GIRNotification', 'QDMTT', 'TPDocOther', 'AnnualAPAReport', 'RelatedPartyDisclosure', 'PEAuxiliaryCalculation', 'ContemporaneousTPDocumentation', 'USSec6662Documentation', 'SITDisclosure', 'MasterFileNotification', 'SpecialItemReport');

-- CreateEnum
CREATE TYPE "OrganizationTypeId" AS ENUM ('Legislation', 'TaxAdmin', 'Regulation', 'OtherPrimarySource', 'ConsultingFirm', 'InternationalOrg', 'OtherSecondarySource');

-- CreateEnum
CREATE TYPE "ScopeOfObligationId" AS ENUM ('Group', 'TaxGroup', 'Entity');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('WaitForUrlSafeBrowsingCheck', 'WaitForUrlMalwareScan', 'RejectedUrl', 'WaitForValidation', 'RejectedByAdmin', 'WaitForScrapping', 'UrlNotFound', 'ScanForMalware', 'RejectedByMalwareScan', 'WaitForOCR', 'WaitForAI', 'FullyProcessed');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('URL', 'FILES');

-- CreateEnum
CREATE TYPE "SubmissionMethodId" AS ENUM ('Electronic', 'Paper', 'UponRequest', 'NoDirectFiling', 'Mixed', 'NotApplicable', 'Other');

-- CreateEnum
CREATE TYPE "ValuesStatus" AS ENUM ('WaitingForAdminValidation', 'Accepted', 'Rejected');

-- CreateTable
CREATE TABLE "oauth_access_token" (
    "access_key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "oauth_access_token_pkey" PRIMARY KEY ("access_key")
);

-- CreateTable
CREATE TABLE "otc_access_token" (
    "access_key" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "otc_access_token_pkey" PRIMARY KEY ("access_key")
);

-- CreateTable
CREATE TABLE "otc_access_token_audit" (
    "access_key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otc_access_token_audit_pkey" PRIMARY KEY ("access_key")
);

-- CreateTable
CREATE TABLE "otc_llm_value" (
    "id" BIGSERIAL NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "obligation_type_id" "ObligationTypeId" NOT NULL,
    "source_id" INTEGER NOT NULL,
    "version" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "reference" TEXT NOT NULL DEFAULT '',
    "additional_values" JSONB,
    "tag_notes" TEXT NOT NULL DEFAULT '',
    "judge_llm_score" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "otc_llm_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otc_source_llm_meta" (
    "id" BIGSERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "date_of_publication" TIMESTAMP(3),
    "version" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otc_source_llm_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otc_user_value" (
    "id" BIGSERIAL NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "obligation_type_id" "ObligationTypeId" NOT NULL,
    "source_id" INTEGER NOT NULL,
    "version" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "reference" TEXT NOT NULL DEFAULT '',
    "additional_values" JSONB,
    "status" "ValuesStatus" NOT NULL DEFAULT 'WaitingForAdminValidation',
    "admin_comment" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,

    CONSTRAINT "otc_user_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source" (
    "id" SERIAL NOT NULL,
    "source_name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "organization_type_id" "OrganizationTypeId" NOT NULL,
    "jurisdictions" TEXT[],
    "obligation_type_ids" "ObligationTypeId"[],
    "indicators" TEXT[],
    "proposer_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),
    "validator_email" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'WaitForValidation',
    "source_type" "SourceType" NOT NULL,
    "link" TEXT,
    "comment" TEXT,
    "file_uuids" TEXT[],
    "ocr_file_ids" INTEGER[],
    "admin_comment" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_users" (
    "email" TEXT NOT NULL,

    CONSTRAINT "trusted_users_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "auth_user" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "picture" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "job" TEXT,
    "pro_email" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "cgu" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_rate" (
    "id" BIGSERIAL NOT NULL,
    "rate" INTEGER NOT NULL,
    "comment" TEXT,
    "user_id" TEXT NOT NULL,
    "user_value_id" BIGINT,
    "llm_value_id" BIGINT,
    "rated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "value_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_analysis" (
    "id" BIGSERIAL NOT NULL,
    "scan_id" TEXT NOT NULL,
    "scan_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_id" INTEGER NOT NULL,

    CONSTRAINT "scan_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_access_token_access_key_key" ON "oauth_access_token"("access_key");

-- CreateIndex
CREATE UNIQUE INDEX "otc_access_token_access_key_key" ON "otc_access_token"("access_key");

-- CreateIndex
CREATE UNIQUE INDEX "otc_access_token_audit_access_key_key" ON "otc_access_token_audit"("access_key");

-- CreateIndex
CREATE INDEX "otc_llm_value_source_id_jurisdiction_obligation_type_id_key_idx" ON "otc_llm_value"("source_id", "jurisdiction", "obligation_type_id", "key");

-- CreateIndex
CREATE INDEX "otc_source_llm_meta_source_id_idx" ON "otc_source_llm_meta"("source_id");

-- CreateIndex
CREATE INDEX "otc_user_value_source_id_jurisdiction_obligation_type_id_idx" ON "otc_user_value"("source_id", "jurisdiction", "obligation_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_users_email_key" ON "trusted_users"("email");

-- CreateIndex
CREATE INDEX "trusted_users_email_idx" ON "trusted_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_id_key" ON "auth_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_email_key" ON "auth_user"("email");

-- CreateIndex
CREATE INDEX "auth_user_email_idx" ON "auth_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "scan_analysis_scan_id_key" ON "scan_analysis"("scan_id");

-- CreateIndex
CREATE UNIQUE INDEX "scan_analysis_source_id_key" ON "scan_analysis"("source_id");

-- CreateIndex
CREATE INDEX "scan_analysis_source_id_idx" ON "scan_analysis"("source_id");

-- AddForeignKey
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otc_access_token" ADD CONSTRAINT "otc_access_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otc_llm_value" ADD CONSTRAINT "otc_llm_value_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otc_source_llm_meta" ADD CONSTRAINT "otc_source_llm_meta_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otc_user_value" ADD CONSTRAINT "otc_user_value_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otc_user_value" ADD CONSTRAINT "otc_user_value_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_rate" ADD CONSTRAINT "value_rate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_rate" ADD CONSTRAINT "value_rate_user_value_id_fkey" FOREIGN KEY ("user_value_id") REFERENCES "otc_user_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_rate" ADD CONSTRAINT "value_rate_llm_value_id_fkey" FOREIGN KEY ("llm_value_id") REFERENCES "otc_llm_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_analysis" ADD CONSTRAINT "scan_analysis_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
