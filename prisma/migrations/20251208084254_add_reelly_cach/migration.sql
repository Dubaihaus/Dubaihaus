-- CreateTable
CREATE TABLE "ReellyProject" (
    "id" INTEGER NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locationString" TEXT,
    "city" TEXT,
    "area" TEXT,
    "region" TEXT,
    "district" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "developerName" TEXT,
    "status" TEXT,
    "saleStatus" TEXT,
    "constructionStatus" TEXT,
    "priceFrom" DECIMAL(65,30),
    "priceTo" DECIMAL(65,30),
    "currency" TEXT DEFAULT 'AED',
    "bedroomsMin" INTEGER,
    "bedroomsMax" INTEGER,
    "areaFrom" DECIMAL(65,30),
    "areaTo" DECIMAL(65,30),
    "areaUnit" TEXT,
    "completionDate" TIMESTAMP(3),
    "handoverDate" TIMESTAMP(3),
    "mainImageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReellyProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReellyProjectPaymentPlan" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT,
    "rawData" JSONB,

    CONSTRAINT "ReellyProjectPaymentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReellyProjectPropertyType" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "priceFrom" DECIMAL(65,30),
    "sizeFrom" DECIMAL(65,30),
    "rawData" JSONB,

    CONSTRAINT "ReellyProjectPropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReellyProject_slug_key" ON "ReellyProject"("slug");

-- AddForeignKey
ALTER TABLE "ReellyProjectPaymentPlan" ADD CONSTRAINT "ReellyProjectPaymentPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ReellyProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReellyProjectPropertyType" ADD CONSTRAINT "ReellyProjectPropertyType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ReellyProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
