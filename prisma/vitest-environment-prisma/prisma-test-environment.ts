import { Environment } from 'vitest/environments'
import 'dotenv/config'
import { randomUUID } from 'crypto'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export default <Environment>{
  name: 'prisma',
  transformMode: 'ssr',
  async setup() {
    if (!process.env.DATABASE_URL) {
      throw new Error('Please provide a DATABASE_URL environment variable.')
    }
    const url = new URL(process.env.DATABASE_URL)

    const schema = randomUUID()
    url.searchParams.set('schema', schema)

    process.env.DATABASE_URL = url.toString()

    execSync('npx prisma migrate deploy')

    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )
        await prisma.$disconnect()
      },
    }
  },
}
