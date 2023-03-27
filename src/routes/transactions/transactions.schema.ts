import { FastifyReply } from 'fastify'
import { z, ZodError } from 'zod'
import { validationError } from '../../utils/validation.error'

class TransactionsSchema {
  validation: <T>(
    err: { error: ZodError<T> } | { data: T },
    reply: FastifyReply,
  ) => any

  constructor() {
    this.validation = function <T>(
      err: { error: ZodError<T> } | { data: T },
      reply: FastifyReply,
    ) {
      validationError<T>({
        reply,
        error: err,
        status: 400,
      })
    }
  }

  post(body: any, reply: FastifyReply) {
    const { success, ...err } = z
      .object({
        title: z.string().min(8),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })
      .safeParse(body)

    if (!success) return this.validation(err, reply)
  }

  delete(body: any, reply: FastifyReply) {
    const { success, ...err } = z
      .object({
        id: z.string().uuid(),
      })
      .safeParse(body)
    if (!success) return this.validation(err, reply)
  }

  pick(body: any, reply: FastifyReply) {
    const { success, ...err } = z
      .object({
        id: z.string().uuid(),
      })
      .safeParse(body)
    if (!success) return this.validation(err, reply)
  }
}

export const transactionsSchema = new TransactionsSchema()
