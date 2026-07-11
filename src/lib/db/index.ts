import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  typeof window === "undefined" ? globalThis.prisma || new PrismaClient() : ({} as PrismaClient);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
