-- CreateTable
CREATE TABLE "ProjectTranslation" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "originalHash" TEXT NOT NULL,
    "translated" JSONB NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectTranslation_projectId_lang_idx" ON "ProjectTranslation"("projectId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranslation_projectId_lang_fieldKey_key" ON "ProjectTranslation"("projectId", "lang", "fieldKey");
