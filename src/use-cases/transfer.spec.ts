import { describe, it, beforeEach, expect } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { TransferUseCase } from './transfer'
import { InMemoryTransactionsRepository } from '@/repositories/in-memory/in-memory-transactions-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { UnauthorizedError } from './err/unauthorizedError '
import { ValueMustBeGreaterThanZero } from './err/value-must-be-greater-than-zero'
import { NoCreditsError } from './err/no-credits-error'
import { PayeeNotFound } from './err/payee-not-found'
import { InMemoryWalletsRepository } from '@/repositories/in-memory/in-memory-wallets-repository'

let walletsRepository: InMemoryWalletsRepository
let usersRepository: InMemoryUsersRepository
let transactionsRepository: InMemoryTransactionsRepository
let sut: TransferUseCase

describe('Transfer Use Case', () => {
  beforeEach(async () => {
    walletsRepository = new InMemoryWalletsRepository()
    usersRepository = new InMemoryUsersRepository(walletsRepository)
    transactionsRepository = new InMemoryTransactionsRepository(
      usersRepository,
      walletsRepository,
    )
    sut = new TransferUseCase(transactionsRepository)
  })
  it('It should be able to test the accuracy of the transaction.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'USER',
      phone: '+5581983276366',
    })

    walletsRepository.items[0].amount =
      walletsRepository.items[0].amount.plus(100)

    const user1Wallet = walletsRepository.items[0]

    const user2 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    const user2Wallet = walletsRepository.items[1]

    for (let i = 0; i < 3; i++) {
      await sut.execute({
        payerId: user1.id,
        value: new Decimal(33.33),
        payeeId: user2.id,
      })
    }

    expect(user1Wallet.amount).toEqual(new Decimal(0.01))
    expect(user2Wallet.amount).toEqual(new Decimal(99.99))
  })
  it('Should not be able payer transfer to yourself.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'USER',
      phone: '+5581983276366',
    })

    await expect(async () => {
      await sut.execute({
        payerId: user1.id,
        value: new Decimal(33.33),
        payeeId: user1.id,
      })
    }).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('Should not be able payer transfer with negative value.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'USER',
      phone: '+5581983276366',
    })

    const user2 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    await expect(async () => {
      await sut.execute({
        payerId: user1.id,
        value: new Decimal(-33.33),
        payeeId: user2.id,
      })
    }).rejects.toBeInstanceOf(ValueMustBeGreaterThanZero)
  })
  it('Should not be able to transfer without credits.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'USER',
      phone: '+5581983276366',
    })

    const user2 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    await expect(async () => {
      await sut.execute({
        payerId: user1.id,
        value: new Decimal(240.33),
        payeeId: user2.id,
      })
    }).rejects.toBeInstanceOf(NoCreditsError)
  })
  it('Should not be able to transfer to wrong id.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'USER',
      phone: '+5581983276366',
    })

    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    await expect(async () => {
      await sut.execute({
        payerId: user1.id,
        value: new Decimal(40.33),
        payeeId: 'Random id',
      })
    }).rejects.toBeInstanceOf(PayeeNotFound)
  })

  it('Seller should not be able to make transfer.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    const user2 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    await expect(async () => {
      await sut.execute({
        payerId: user1.id,
        value: new Decimal(40.33),
        payeeId: user2.id,
      })
    }).rejects.toBeInstanceOf(UnauthorizedError)
  })
  it('should be able to test the accuracy.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',

      role: 'USER',
      phone: '+5581983276366',
    })

    walletsRepository.items[0].amount =
      walletsRepository.items[0].amount.plus(876.234452)

    const user1Wallet = walletsRepository.items[0]

    const user2 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',

      role: 'SELLER',
      phone: '+5581983276366',
    })

    walletsRepository.items[1].amount =
      walletsRepository.items[1].amount.plus(123.23422)

    const user2Wallet = walletsRepository.items[1]

    await sut.execute({
      payerId: user1.id,
      value: new Decimal(234.00033),
      payeeId: user2.id,
    })

    expect(user1Wallet.amount).toEqual(new Decimal(642.234122))
    expect(user2Wallet.amount).toEqual(new Decimal(357.23455))
  })
  it('Should be able to create transaction.', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe1@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf',
      role: 'USER',
      phone: '+5581983276366',
    })

    walletsRepository.items[0].amount =
      walletsRepository.items[0].amount.plus(876.234452)

    const user2 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@example.com',
      password_hash: '123123',
      cpf_cnpj: 'user cpf2',
      role: 'SELLER',
      phone: '+5581983276366',
    })

    walletsRepository.items[1].amount =
      walletsRepository.items[1].amount.plus(123.23422)

    const { transaction } = await sut.execute({
      payerId: user1.id,
      value: new Decimal(234.00033),
      payeeId: user2.id,
    })

    console.log(transaction)

    expect(transaction?.payer_sender_id).toEqual(user1.id)
    expect(transaction?.payee_received_id).toEqual(user2.id)
    expect(transaction?.value).toEqual(new Decimal(234.00033))
  })
})
