import { Transaction } from '@prisma/client'
import { TransacitonsRepository } from '../transactions-repository'
import { InMemoryUsersRepository } from './in-memory-users-repository'
import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/library'
import { UnauthorizedError } from '@/use-cases/err/unauthorizedError '
import { ValueMustBeGreaterThanZero } from '@/use-cases/err/value-must-be-greater-than-zero'
import { NoCreditsError } from '@/use-cases/err/no-credits-error'
import { PayeeNotFound } from '@/use-cases/err/payee-not-found'
import { InMemoryWalletsRepository } from './in-memory-wallets-repository'

export class InMemoryTransactionsRepository implements TransacitonsRepository {
  public items: Transaction[] = []

  constructor(
    private inMemoryUsersRepository: InMemoryUsersRepository,
    private inMemoryWalletsRepository: InMemoryWalletsRepository,
  ) {}

  async atomicTransaction(
    payerId: string,
    value: Decimal,
    payeeId: string,
  ): Promise<Transaction> {
    if (value.lte(0)) {
      throw new ValueMustBeGreaterThanZero()
    }

    const payer = await this.inMemoryUsersRepository.findById(payerId)
    const payee = await this.inMemoryUsersRepository.findById(payeeId)

    if (!payer || payer.role === 'SELLER' || payer.id === payeeId) {
      throw new UnauthorizedError()
    }

    if (!payee) {
      throw new PayeeNotFound()
    }

    const payerWallet =
      await this.inMemoryWalletsRepository.findByUserId(payerId)
    const payeeWallet =
      await this.inMemoryWalletsRepository.findByUserId(payeeId)

    if (!payerWallet || !payeeWallet) {
      throw new Error('Wallet not found')
    }

    if (payerWallet.amount.lessThan(value)) {
      throw new NoCreditsError()
    }

    payerWallet.amount = payerWallet.amount.minus(value)
    payeeWallet.amount = payeeWallet.amount.plus(value)

    const transaction = {
      id: randomUUID(),
      value,
      payer_sender_id: payer.id,
      payee_received_id: payee.id,
      from_cpf_cnpj: payer.cpf_cnpj,
      to_cpf_cnpj: payee.cpf_cnpj,
      to_phone: payee.phone,
      created_at: new Date(),
    }

    this.items.push(transaction)

    return transaction
  }
}
