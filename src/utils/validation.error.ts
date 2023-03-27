import { FastifyReply } from 'fastify'
import { CustomZodError } from '../interfaces/shared'

interface ValidationErrorProps<T> {
  reply?: FastifyReply
  error: CustomZodError<T>
  status: number
}

export const validationError = <T>({
  reply,
  error,
  status,
}: ValidationErrorProps<T>) => {
  console.log(error)
  return reply?.status(status).send(error)
}
