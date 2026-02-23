import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearReelly() {
  try {
    await prisma.$transaction([
      prisma.reellyProject.deleteMany({})
    ]);

    console.log("✅ All Reelly projects deleted successfully.");
  } catch (error) {
    console.error("❌ Error deleting Reelly data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearReelly();