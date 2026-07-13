import fastify from 'fastify'

const app = fastify()

app.get('/health', () => {
  return 'OK'
})

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Back-end is running at http://localhost:3333/')
})
