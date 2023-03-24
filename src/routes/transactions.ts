// eslint-disable-next-line
import {randomUUID} from 'crypto'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'
import { cookiesDefault } from '../utils/cookies'
import { formatDate } from '../utils/format-date'
import { validationError } from '../utils/validation.error'
import {
  TransactionsDeleteParams,
  TransactionsPickParams,
  TransactionsPostBody,
} from './transactions.interface'
import { transactionsSchema } from './transactions.schema'

type RequestBody<T> = FastifyRequest & { body: T }

type RequestParams<T> = FastifyRequest & { params: T }

export const transactionsRoutes = async (app: FastifyInstance) => {
  // GET => "/"
  app.get('/', async ({ cookies }, reply) => {
    await knex('transactions')
      .where({
        session_id: cookies.session_id ?? '',
      })
      .then((data) =>
        reply
          .code(200)
          .send(
            data.length > 0
              ? data
              : { message: 'No one transaction encoutered!' },
          ),
      )
      .catch((err) => reply.code(500).send(err))
  })

  // GET => "/summary"
  app.get(
    '/summary',
    // @ts-ignore
    async (req, reply) => {
      try {
        const sessionId = req.cookies.session_id

        if (!sessionId) {
          return reply.code(404).send({
            message: 'No one transaction encountered!',
          })
        }

        await knex('transactions')
          .where({
            session_id: sessionId,
          })
          .sum('amount', { as: 'amount' })
          .then((data) => {
            return reply
              .status(200)
              .send(data)
              .cookie('session_id', sessionId, cookiesDefault)
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
      const { success, ...err } = transactionsSchema.delete(params)
      if (!success) {
        validationError<TransactionsPickParams>({
          reply,
          error: { ...err },
          status: 400,
        })
      }
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
                error: { ...err },
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
    ({ body, cookies }: RequestBody<TransactionsPostBody>, reply) => {
      const { success, ...err } = transactionsSchema.post(body)
      if (!success) {
        return validationError<TransactionsPostBody>({
          reply,
          error: { ...err },
          status: 401,
        })
      }
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

        knex('transactions')
          .insert(toInsert)
          .then(() =>
            reply
              .status(201)
              .cookie('session_id', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
              })
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
      const { success, ...err } = transactionsSchema.delete(params)
      if (!success) {
        validationError<TransactionsDeleteParams>({
          reply,
          error: { ...err },
          status: 401,
        })
      }
      try {
        const { id } = params

        await knex('transactions')
          .where('id', id)
          .and.where('session_id', cookies.session_id)
          .delete()
          .or.then((data) => {
            if (!data) {
              validationError<TransactionsDeleteParams>({
                reply,
                error: { ...err },
                status: 404,
              })
            }
            return reply.status(data ? 204 : 400).send(data)
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
