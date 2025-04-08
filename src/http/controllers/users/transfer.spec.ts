import { app } from '@/app'
import { describe, afterAll, beforeAll, expect, it } from 'vitest'
import request from 'supertest'
import { createAndAuthenticateUser } from '@/utils/tests/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'

describe('Transfer tests e2e', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to authenticate user', async () => {
    const users = await createAndAuthenticateUser()
    await prisma.user.update({
      where: { id: users.payer?.id },
      data: {
        walletBalance: users.payer?.walletBalance.plus(100),
      },
    })

    const response = await request(app.server)
      .post(`/users/transfer/${users.payee?.id}`)
      .send({
        value: 20,
      })
      .set('Authorization', `Bearer ${users.userToken}`)

    expect([201, 403]).toContain(response.statusCode)
  })
})
