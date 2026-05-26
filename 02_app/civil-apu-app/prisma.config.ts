import { defineConfig } from 'prisma/config'

export default defineConfig({
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
})
