import bcrypt from 'bcrypt'

class EncryptUtil {
  salt: string

  constructor() {
    const saltRounds = 10
    this.salt = bcrypt.genSaltSync(saltRounds)
  }

  encryptString(password: string) {
    return bcrypt.hashSync(password, this.salt)
  }

  decryptString(password: string, encrypted: string) {
    return bcrypt.compareSync(password, encrypted)
  }
}

export const encryptUtil = new EncryptUtil()
