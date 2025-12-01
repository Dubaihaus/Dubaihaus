// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"], // you can add "query" in dev if you want
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
