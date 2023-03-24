import { z } from 'zod'

class TransactionsSchema {
  post(body: any) {
    return z
      .object({
        title: z.string().min(8),
        amount: z.number().min(10, 'Invalid "amount"!'),
      })
      .safeParse(body)
  }

  delete(body: any) {
    return z
      .object({
        id: z.string().min(36).max(36),
      })
      .safeParse(body)
  }
}

export const transactionsSchema = new TransactionsSchema()
