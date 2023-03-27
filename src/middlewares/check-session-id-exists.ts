import { FastifyReply } from 'fastify'
import { TransactionsDeleteParams } from '../routes/transactions/transactions.interface'
import { validationError } from '../utils/validation.error'

export async function checkSessionIdExists(req: any, reply: FastifyReply) {
  const sessionId = req.cookies.session_id

  if (!sessionId)
    return await validationError<TransactionsDeleteParams>({
      reply,
      error: { message: 'Do not has a session_id!' },
      status: 401,
    })
}
