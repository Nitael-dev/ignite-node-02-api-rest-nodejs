import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions/transactions'
import { authRoutes } from './routes/auth/auth'

const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, {
  prefix: '/transactions',
})
app.register(authRoutes, {
  prefix: '/',
})

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server runnning')
})
