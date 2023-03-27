// eslint-disable-next-line
import {randomUUID} from 'crypto'
import { FastifyInstance, FastifyReply } from 'fastify'
import { knex } from '../../database'
import { RequestParams } from '../../interfaces/shared'
import { checkSessionIdExists } from '../../middlewares/check-session-id-exists'
import { cookiesDefault } from '../../utils/cookies'
import { formatDate } from '../../utils/format-date'
import { validationError } from '../../utils/validation.error'
import {
  TransactionsDeleteParams,
  TransactionsPickParams,
  TransactionsPostBody,
} from './transactions.interface'
import { transactionsSchema } from './transactions.schema'

export async function transactionsRoutes(app: FastifyInstance) {
  // Hooks
  app.addHook('preHandler', checkSessionIdExists)

  // GET => "/"
  app.get('/', async ({ cookies }, reply) => {
    await knex('transactions')
      .where({
        session_id: cookies.session_id ?? '',
      })
      .then((data) =>
        reply.code(200).send(
          data.length > 0
            ? {
                transactions: data,
              }
            : { message: 'No one transaction encoutered!' },
        ),
      )
      .catch((err) => reply.code(500).send(err))
  })

  // GET => "/summary"
  app.get(
    '/summary',
    // @ts-ignore
    async ({ cookies }, reply) => {
      try {
        await knex('transactions')
          .where({
            session_id: cookies.session_id,
          })
          .sum('amount', { as: 'amount' })
          .then((data) => {
            return reply
              .status(200)
              .send({ summary: data[0] })
              .cookie(
                'session_id',
                cookies.sessionId ?? randomUUID(),
                cookiesDefault,
              )
          })
          .catch((err) => {
            console.log('catch', err)
            return reply.status(500).send()
          })
      } catch (err) {
        console.log('transaction delete err', err)
        return err
      }
    },
  )

  // GET => "/:id"
  app.get(
    '/:id',
    // @ts-ignore
    async (
      { params, cookies }: RequestParams<TransactionsPickParams>,
      reply: FastifyReply,
    ) => {
      // Schema
      await transactionsSchema.delete(params, reply)

      try {
        const { id } = params

        await knex('transactions')
          .where({ id })
          .andWhere(function () {
            this.where({
              session_id: cookies.session_id ?? '',
            })
          })
          .first()
          .then((data) => {
            if (!data) {
              return validationError<TransactionsDeleteParams>({
                reply,
                error: { message: 'No one transaction founded!' },
                status: 404,
              })
            }
            return reply.status(200).send(data)
          })
          .catch((err) => {
            console.log('catch', err)
            return reply.status(500).send()
          })
      } catch (err) {
        console.log('transaction delete err', err)
        return err
      }
    },
  )

  // POST => "/"
  app.post(
    '/',
    // @ts-ignore
    async ({ body, cookies }: RequestParams<TransactionsPostBody>, reply) => {
      // Schema
      await transactionsSchema.post(body, reply)

      try {
        const { title, amount, type } = body
        const sessionId = cookies.session_id ?? randomUUID()

        const toInsert = {
          id: randomUUID(),
          title,
          amount: type === 'credit' ? amount : amount * -1,
          type,
          created_at: formatDate(new Date()),
          session_id: sessionId,
        }

        await knex('transactions')
          .insert(toInsert)
          .then(() =>
            reply
              .status(201)
              .cookie('session_id', sessionId, cookiesDefault)
              .send(toInsert),
          )
          .catch((err) => reply.status(500).send(err))
      } catch (err) {
        console.log('transactions insert err', err)
        return err
      }
    },
  )

  // DELETE => "/:id"
  app.delete(
    '/:id',
    // @ts-ignore
    async (
      { params, cookies }: RequestParams<TransactionsDeleteParams>,
      reply: FastifyReply,
    ) => {
      // Schema
      await transactionsSchema.delete(params, reply)

      try {
        const { id } = params

        await knex('transactions')
          .where('id', id)
          .and.where('session_id', cookies.session_id)
          .delete()
          .or.then((data) => {
            if (!data) {
              return validationError<TransactionsDeleteParams>({
                reply,
                error: { message: 'No one transaction founded!' },
                status: 404,
              })
            }
            return reply.status(data ? 204 : 404).send(data)
          })
          .catch((err) => {
            console.log('catch', err)
            return reply.status(500).send()
          })
      } catch (err) {
        console.log('transaction delete err', err)
        return err
      }
    },
  )
}
