import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { cpf } from 'cpf-cnpj-validator'
import request from 'supertest'

export async function createAndAuthenticateUser() {
  await request(app.server).post('/users').send({
    name: 'Jhon',
    email: 'Jhondoe@example.com',
    password: '123123',
    user_cpf_cnpj: cpf.generate(),
    role: 'USER',
    phone: '+5581983276366',
  })

  await request(app.server).post('/users').send({
    name: 'Jhon',
    email: 'Jhondoe2@example.com',
    password: '123123',
    user_cpf_cnpj: cpf.generate(),
    role: 'USER',
    phone: '+5581983276466',
  })

  const userAuthenticate = await request(app.server).post('/login').send({
    email: 'Jhondoe@example.com',
    password: '123123',
  })

  const payer = await prisma.user.findUnique({
    where: { email: 'Jhondoe@example.com' },
  })

  const payee = await prisma.user.findUnique({
    where: { email: 'Jhondoe2@example.com' },
  })

  const [cookies] = userAuthenticate.headers['set-cookie']
  const userToken = userAuthenticate.body.token

  return {
    payee,
    payer,
    userToken,
    cookies,
  }
}
