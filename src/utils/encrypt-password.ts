import bcrypt from 'bcrypt'

export function encryptString(password: string) {
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)

  const parsedPassword = bcrypt.hashSync(password, salt)

  return parsedPassword
}
