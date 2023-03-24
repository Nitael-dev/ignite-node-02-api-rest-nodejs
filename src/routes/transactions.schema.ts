import { z } from 'zod'

class TransactionsSchema {
  post(body: any) {
    return z
      .object({
        title: z.string().min(8),
        amount: z.number().min(10, 'Invalid "amount"!'),
        type: z.enum(['credit', 'debit']),
      })
      .safeParse(body)
  }

  delete(body: any) {
    return z
      .object({
        id: z.string().uuid(),
      })
      .safeParse(body)
  }

  pick(body: any) {
    return z
      .object({
        id: z.string().uuid(),
      })
      .safeParse(body)
  }
}

export const transactionsSchema = new TransactionsSchema()
