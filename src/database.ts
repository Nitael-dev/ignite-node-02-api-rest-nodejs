import { knex as setupKenex } from 'knex'

export const knex = setupKenex({
  client: 'sqlite',
  connection: {
    filename: './tmp/app.db',
  },
})
