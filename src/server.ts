import 'dotenv/config'

import cors from '@fastify/cors'
import fastify from 'fastify'

import { authRoutes } from './routes/auth'
import { memoriesRoutes } from './routes/memories'

const app = fastify()

app.register(cors, {
  origin: true,
})

app.get('/health', () => {
  return 'OK'
})

app.register(authRoutes)
app.register(memoriesRoutes)

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Back-end is running at http://localhost:3333/')
})
