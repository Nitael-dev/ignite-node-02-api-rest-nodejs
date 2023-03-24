import { FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import { DynamicObject } from '../interfaces/shared'

interface ValidationErrorProps<T> {
  reply: FastifyReply
  error: { error: ZodError<T> } | { data: DynamicObject<T> }
  status: number
}

export const validationError = <T>({
  reply,
  error,
  status,
}: ValidationErrorProps<T>) => {
  console.log(error)
  return reply.status(status).send(error)
}
