import { FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import { DynamicObject } from '../interfaces/shared'

interface ValidationErrorProps<T> {
  res: FastifyReply
  error: { error: ZodError<T> } | { data: DynamicObject<T> }
  status: number
}

export const validationError = <T>({
  res,
  error,
  status,
}: ValidationErrorProps<T>) => {
  console.log(error)
  return res.status(status).send(error)
}
