import { FastifyReply } from 'fastify'
import { z } from 'zod'
import { validationError } from '../../utils/validation.error'

class AuthSchema {
  post(body: any, reply: FastifyReply) {
    const { success, ...err } = z
      .object({
        email: z.string().email({ message: 'asdasd' }),
        password: z.string().min(8),
      })
      .safeParse(body)
    if (!success)
      return validationError({
        reply,
        error: { ...err },
        status: 400,
      })
  }
}

export const authSchema = new AuthSchema()
