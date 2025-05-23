import { hash } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { AuthenticateUseCase } from './authenticate'
import { InMemoryWalletsRepository } from '@/repositories/in-memory/in-memory-wallets-repository'

let walletsRepository: InMemoryWalletsRepository
let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(async () => {
    walletsRepository = new InMemoryWalletsRepository()
    usersRepository = new InMemoryUsersRepository(walletsRepository)
    sut = new AuthenticateUseCase(usersRepository)
  })
  it('should be able to authenticate user', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
      cpf_cnpj: 'USER CPF',
      role: 'USER',
      phone: '+5581983276366',
    })

    const { user } = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })
})
