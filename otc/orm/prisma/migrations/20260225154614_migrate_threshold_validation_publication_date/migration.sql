/*
  Warnings:

  - The values [GIR,GIRNotification,QDMTT,TPDocOther,AnnualAPAReport,PEAuxiliaryCalculation,ContemporaneousTPDocumentation,USSec6662Documentation,SITDisclosure] on the enum `ObligationTypeId` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `otc_source_llm_meta` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
TRUNCATE otc_llm_value CASCADE;
TRUNCATE otc_user_value CASCADE;
TRUNCATE otc_source_llm_meta CASCADE;
TRUNCATE source CASCADE;
CREATE TYPE "ObligationTypeId_new" AS ENUM ('CIT', 'MasterFile', 'LocalFile', 'AnnualTPForm', 'CbCR', 'PublicCbCR', 'CbCRNotification', 'RelatedPartyDisclosure', 'SimplifiedTPDocumentation', 'MasterFileNotification', 'SpecialItemFile');
ALTER TABLE "otc_llm_value" ALTER COLUMN "obligation_type_id" TYPE "ObligationTypeId_new" USING ("obligation_type_id"::text::"ObligationTypeId_new");
ALTER TABLE "otc_user_value" ALTER COLUMN "obligation_type_id" TYPE "ObligationTypeId_new" USING ("obligation_type_id"::text::"ObligationTypeId_new");
ALTER TABLE "source" ALTER COLUMN "obligation_type_ids" TYPE "ObligationTypeId_new"[] USING ("obligation_type_ids"::text::"ObligationTypeId_new"[]);
ALTER TYPE "ObligationTypeId" RENAME TO "ObligationTypeId_old";
ALTER TYPE "ObligationTypeId_new" RENAME TO "ObligationTypeId";
DROP TYPE "ObligationTypeId_old" CASCADE;
COMMIT;

-- DropForeignKey
ALTER TABLE "otc_source_llm_meta" DROP CONSTRAINT "otc_source_llm_meta_source_id_fkey";

-- AlterTable
ALTER TABLE "source" ADD COLUMN     "date_of_publication" TIMESTAMP(3);

-- DropTable
DROP TABLE "otc_source_llm_meta" CASCADE;
