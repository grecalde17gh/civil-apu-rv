import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL or DIRECT_URL environment variable required for Prisma migrations')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
})
