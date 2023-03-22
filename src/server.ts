import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/users', () => {
  const tables = knex('sqlite_schema').select('*')

  return tables
})

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server runnning')
})