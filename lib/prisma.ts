import pg from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

// eslint-disable-next-line no-shadow-restricted-names
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
