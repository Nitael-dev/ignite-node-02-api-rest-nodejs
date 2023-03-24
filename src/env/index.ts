import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z.any().transform((data: string | null) => {
    const regex = /[^0-9]/g
    const isValid = data && data.replace(regex, '') === data

    const parsedValue = data
      ? isValid
        ? Number(data.replace(regex, ''))
        : 3333
      : 3333
    if (isValid) {
      if (parsedValue >= 0 && parsedValue < 65536) {
        return parsedValue
      }
      return 3333
    }
    return parsedValue
  }),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.log('😵 Invalid enviroment variables!')

  throw new Error('Invalid enviroment variables.')
}

export const env = _env.data
