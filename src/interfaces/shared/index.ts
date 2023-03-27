import { FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

export type DynamicObject<T> = T extends [any, ...any]
  ? {
      [K in keyof T]: T[K]
    }
  : {
      [K in keyof T]: T[K]
    }

export type CustomZodError<T> =
  // Zod Default Error
  | { error: ZodError<T> }
  | { data: T }
  // Custom Reply
  | { message: string }

export interface RequestParams<T> extends FastifyRequest {
  params: T
  body: T
  cookies: {
    session_id?: string
  }
}
