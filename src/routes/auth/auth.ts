import { FastifyInstance } from 'fastify'
import { knex } from '../../database'
import { AuthProps } from './auth.interface'
import { authSchema } from './auth.schema'
import { RequestParams } from '../../interfaces/shared'
import { randomUUID } from 'crypto'
import { formatDate } from '../../utils/format-date'
import { encryptString } from '../../utils/encrypt-password'

export async function authRoutes(app: FastifyInstance) {
  // GET => '/users'
  // app.get('/users', async function (__, reply) {
  //   await knex
  //     .table('users')
  //     .select('*')
  //     .then((res) => reply.status(200).send(res))
  //     .catch((err) => reply.status(500).send(err))
  // })

  // POST => '/users'
  app.post(
    '/users',
    // @ts-ignore
    async ({ body }: RequestParams<AuthProps>, reply) => {
      // Schema
      await authSchema.post(body, reply)

      const { email, password } = body

      const encrypted = encryptString(password)

      const toInsert = {
        id: randomUUID(),
        email,
        password: encrypted,
        created_at: formatDate(new Date()),
        session_id: randomUUID(),
      }

      await knex
        .table('users')
        .insert(toInsert)
        .then((data) => {
          if (!data) {
            return reply.status(500).send()
          }
          return reply.status(201).send(toInsert)
        })
        .catch((err) => reply.status(500).send(err))
    },
  )
}
