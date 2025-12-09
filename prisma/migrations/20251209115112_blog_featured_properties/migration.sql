-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "readMinutes" INTEGER,
ADD COLUMN     "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "BlogPostProperty" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BlogPostProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostProperty_blogId_propertyId_key" ON "BlogPostProperty"("blogId", "propertyId");

-- AddForeignKey
ALTER TABLE "BlogPostProperty" ADD CONSTRAINT "BlogPostProperty_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "BlogPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostProperty" ADD CONSTRAINT "BlogPostProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
