/*
  Warnings:

  - You are about to drop the column `blogId` on the `BlogCategory` table. All the data in the column will be lost.
  - You are about to drop the column `blogId` on the `BlogTag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `BlogCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `BlogTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `BlogCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BlogCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `BlogTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BlogTag` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Create new join tables first
CREATE TABLE "BlogPostCategory" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BlogPostCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPostTag" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("id")
);

-- Step 2: Add new columns to BlogCategory with defaults/nullable
ALTER TABLE "BlogCategory" 
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "description" TEXT,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "slug" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Populate slug from name for BlogCategory
-- Using LOWER, REPLACE for basic slugification (matches JS slugify behavior)
UPDATE "BlogCategory" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(TRIM("name"), '\s+', '-', 'g'),
      '[^\w\-]+', '', 'g'
    ),
    '\-\-+', '-', 'g'
  )
)
WHERE "slug" IS NULL;

-- Step 4: Make slug NOT NULL after populating
ALTER TABLE "BlogCategory" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "BlogCategory" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "BlogCategory" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Step 5: Do the same for BlogTag
ALTER TABLE "BlogTag"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "slug" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

UPDATE "BlogTag" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(TRIM("name"), '\s+', '-', 'g'),
      '[^\w\-]+', '', 'g'
    ),
    '\-\-+', '-', 'g'
  )
)
WHERE "slug" IS NULL;

ALTER TABLE "BlogTag" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "BlogTag" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "BlogTag" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Step 6: Now drop the old foreign key constraints
ALTER TABLE "BlogCategory" DROP CONSTRAINT IF EXISTS "BlogCategory_blogId_fkey";
ALTER TABLE "BlogTag" DROP CONSTRAINT IF EXISTS "BlogTag_blogId_fkey";

-- Step 7: Drop the blogId columns (data will be migrated via script to join tables)
ALTER TABLE "BlogCategory" DROP COLUMN "blogId";
ALTER TABLE "BlogTag" DROP COLUMN "blogId";

-- Step 8: Create indexes on new tables
CREATE INDEX "BlogPostCategory_blogId_idx" ON "BlogPostCategory"("blogId");
CREATE INDEX "BlogPostCategory_categoryId_idx" ON "BlogPostCategory"("categoryId");
CREATE UNIQUE INDEX "BlogPostCategory_blogId_categoryId_key" ON "BlogPostCategory"("blogId", "categoryId");

CREATE INDEX "BlogPostTag_blogId_idx" ON "BlogPostTag"("blogId");
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");
CREATE UNIQUE INDEX "BlogPostTag_blogId_tagId_key" ON "BlogPostTag"("blogId", "tagId");

-- Step 9: Create unique constraints on slug
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- Step 10: Add foreign keys to new join tables
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
