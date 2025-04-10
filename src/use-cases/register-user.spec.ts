import { expect, describe, it } from 'vitest'
import { RegisterUseCase } from './register-user'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './err/user-already-exists-error'
import { CpfOrCnpjAlreadyExistsError } from './err/cpf-or-cnpj-error'
import { InvalidCredentialsError } from './err/invalid-credentials-error'
import { InMemoryWalletsRepository } from '@/repositories/in-memory/in-memory-wallets-repository'

describe('Register Use Case', () => {
  it('should be able to create a new user', async () => {
    const walletsRepository = new InMemoryWalletsRepository()
    const inMemoryUsersRepository = new InMemoryUsersRepository(
      walletsRepository,
    )
    const registerUseCase = new RegisterUseCase(inMemoryUsersRepository)

    const { user } = await registerUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      user_cpf_cnpj: '112.830.790-11',
      role: 'USER',
      phone: '+5581983276366',
    })
    expect(user.id).toEqual(expect.any(String))
  })

  it('should be able to test register erros', async () => {
    const walletsRepository = new InMemoryWalletsRepository()
    const inMemoryUsersRepository = new InMemoryUsersRepository(
      walletsRepository,
    )
    const registerUseCase = new RegisterUseCase(inMemoryUsersRepository)

    const email = 'johndoe@example.com'

    await registerUseCase.execute({
      name: 'John Doe',
      email,
      password: '123456',
      user_cpf_cnpj: '112.830.790-11',
      role: 'USER',
      phone: '+5581983276366',
    })
    await expect(
      async () =>
        await registerUseCase.execute({
          name: 'John Doe',
          email,
          password: '123456',
          user_cpf_cnpj: '514.909.970-83',
          role: 'USER',
          phone: '+5581983276366',
        }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)

    await expect(
      async () =>
        await registerUseCase.execute({
          name: 'John Doe',
          email: 'jhondoe2@example.com',
          password: '123456',
          user_cpf_cnpj: '112.830.790-11',
          role: 'USER',
          phone: '+5581983276366',
        }),
    ).rejects.toBeInstanceOf(CpfOrCnpjAlreadyExistsError)

    await expect(
      async () =>
        await registerUseCase.execute({
          name: 'John Doe',
          email: 'jhondoe2@example.com',
          password: '123456',
          user_cpf_cnpj: '112.83.790-11',
          role: 'USER',
          phone: '+5581983276366',
        }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
