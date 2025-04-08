import { Transaction } from '@prisma/client'
import { TransacitonsRepository } from '../transactions-repository'
import { InMemoryUsersRepository } from './in-memory-users-repository'
import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/library'
import { UnauthorizedError } from '@/use-cases/err/unauthorizedError '
import { ValueMustBeGreaterThanZero } from '@/use-cases/err/value-must-be-greater-than-zero'
import { NoCreditsError } from '@/use-cases/err/no-credits-error'
import { PayeeNotFound } from '@/use-cases/err/payee-not-found'

export class InMemoryTransactionsRepository implements TransacitonsRepository {
  public items: Transaction[] = []

  constructor(public inMemorUsersRepository: InMemoryUsersRepository) {}

  async atomicTransaction(
    user_id: string,
    value: Decimal,
    payee: string,
  ): Promise<Transaction> {
    const userPayer = await this.inMemorUsersRepository.findById(user_id)

    if (!userPayer || userPayer.role !== 'USER' || userPayer.id === payee) {
      throw new UnauthorizedError()
    }

    if (value.lte(0)) {
      throw new ValueMustBeGreaterThanZero()
    }

    if (userPayer.walletBalance.sub(value).lt(0)) {
      throw new NoCreditsError()
    }

    const payeeUser = await this.inMemorUsersRepository.findById(payee)

    if (!payeeUser) {
      throw new PayeeNotFound()
    }

    userPayer.walletBalance = userPayer.walletBalance.minus(value)
    payeeUser.walletBalance = payeeUser.walletBalance.plus(value)

    const transaction = {
      id: randomUUID(),
      payer_sender_id: userPayer.id,
      value,
      payee_received_id: payeeUser.id,
      created_at: new Date(),
      from_cpf_cnpj: userPayer.cpf_cnpj,
      to_cpf_cnpj: payeeUser.cpf_cnpj,
      to_phone: payeeUser.phone,
    }

    this.items.push(transaction)

    return transaction
  }
}
