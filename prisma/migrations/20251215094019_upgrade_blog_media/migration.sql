-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('HERO', 'INLINE', 'GALLERY');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "alt" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" "MediaRole" DEFAULT 'INLINE';
