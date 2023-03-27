import { it, afterAll, beforeAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { execSync } from 'child_process'
import { app } from '../src/app'
import { env } from '../src/env'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // let cookies: any

  it('user login', async () => {
    await request(app.server)
      .post('/users')
      .send({
        email: env.TEST_EMAIL,
        password: env.TEST_PASSWORD,
      })
      .expect(200)
  })

  it(
    'new user can create a new transaction and get then',
    async () => {
      const loginReponse = await request(app.server)
        .post('/users')
        .send({
          email: env.TEST_EMAIL,
          password: env.TEST_PASSWORD,
        })
        .expect(200)

      const cookie = loginReponse.get('Set-Cookie')

      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookie)
        .send({
          title: 'Debit transaction',
          amount: 1000,
          type: 'debit',
        })
        .expect(201)

      const getTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookie)
        .expect(200)

      expect(getTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'Debit transaction',
          amount: -1000,
          type: 'debit',
        }),
      ])

      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookie)
        .send({
          title: 'Credit transaction',
          amount: 5000,
          type: 'credit',
        })
        .expect(201)

      const getSummary = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookie)
        .expect(200)

      expect(getSummary.body).toEqual(
        expect.objectContaining({
          summary: {
            amount: 4000,
          },
        }),
      )

      await request(app.server)
        .get(
          `/transactions/${String(
            getTransactionsResponse.body.transactions[0].id,
          )}`,
        )
        .set('Cookie', cookie)
        .expect(200)
    },
    {
      timeout: 10000,
    },
  )
})
