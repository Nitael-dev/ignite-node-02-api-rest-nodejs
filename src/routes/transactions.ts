import { randomUUID } from 'crypto'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'
import { formatDate } from '../utils/format-date'
import { validationError } from '../utils/validation.error'
import {
  TransactionsDeleteParams,
  TransactionsPostBody,
} from './transactions.interface'
import { transactionsSchema } from './transactions.schema'

interface RequestBody<T> extends FastifyInstance {
  body: T
}

type RequestParams<T> = FastifyRequest & { params: T }

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', async () => {
    const tables = knex('transactions').select('*')
    return tables
  })

  // @ts-ignore
  app.post('/', (req: RequestBody<TransactionsPostBody>, res) => {
    const { success, ...err } = transactionsSchema.post(req.body)
    if (!success) {
      validationError<TransactionsPostBody>({
        res,
        error: { ...err },
        status: 401,
      })
    }
    try {
      const { title, amount } = req.body

      const body = {
        id: randomUUID(),
        title,
        amount,
        created_at: formatDate(new Date()),
      }

      knex('transactions')
        .insert(body)
        .catch((err) => console.log(err))
      return body
    } catch (err) {
      console.log('transactions insert err', err)
      return err
    }
  })

  app.delete(
    '/:id',
    // @ts-ignore
    async (
      { params }: RequestParams<TransactionsDeleteParams>,
      res: FastifyReply,
    ) => {
      const { success, ...err } = transactionsSchema.delete(params)
      if (!success) {
        validationError<TransactionsDeleteParams>({
          res,
          error: { ...err },
          status: 401,
        })
      }
      try {
        const { id } = params

        await knex('transactions')
          .where({ id })
          .delete()
          .then((data) => {
            console.log('then', data)
            if (data === 0) {
              validationError<TransactionsDeleteParams>({
                res,
                error: { ...err },
                status: 404,
              })
            }
            return res.status(204).send()
          })
          .catch((err) => {
            console.log('catch', err)
            return res.status(500).send()
          })
      } catch (err) {
        console.log('transaction delete err', err)
        return err
      }
    },
  )
}
