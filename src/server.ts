import 'dotenv/config'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fastify from 'fastify'

import { PrismaClient } from './generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const app = fastify()

const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
const prisma = new PrismaClient({ adapter })

app.get('/health', () => {
  return 'OK'
})

app.get('/users', async () => {
  const users = await prisma.user.findMany()

  return users
})

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Back-end is running at http://localhost:3333/')
})
