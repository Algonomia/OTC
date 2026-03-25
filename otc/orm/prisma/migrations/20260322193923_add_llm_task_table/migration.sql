-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "otc_llm_value" ADD COLUMN     "judge_llm_reasoning" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "otc_ai_task" (
    "jurisdiction" TEXT NOT NULL,
    "obligation_type" "ObligationTypeId" NOT NULL,
    "group" TEXT NOT NULL,
    "indicators" TEXT[],
    "status" "AiJobStatus" NOT NULL DEFAULT 'PENDING',
    "job_id" TEXT,
    "retry_after" TIMESTAMP(3),
    "source_id" INTEGER NOT NULL,

    CONSTRAINT "otc_ai_task_pkey" PRIMARY KEY ("source_id","jurisdiction","obligation_type","group")
);

-- AddForeignKey
ALTER TABLE "otc_ai_task" ADD CONSTRAINT "otc_ai_task_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
