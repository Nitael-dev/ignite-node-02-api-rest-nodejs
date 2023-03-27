export interface TransactionsPostBody {
  title: string
  amount: number
  type: 'credit' | 'debit'
}

export interface TransactionsDeleteParams {
  id: string
}

export interface TransactionsPickParams {
  id: string
}
