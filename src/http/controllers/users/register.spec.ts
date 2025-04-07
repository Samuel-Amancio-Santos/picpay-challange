import { app } from '@/app'
import { describe, afterAll, beforeAll, expect, it } from 'vitest'
import request from 'supertest'

describe('Register tests e2e', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to registe user', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'samuel',
      email: 'Amancio@gmail.com',
      password: '123123',
      user_cpf_cnpj: '112.830.790-11',
      role: 'USER',
    })

    expect(response.statusCode).toEqual(201)
  })
})
