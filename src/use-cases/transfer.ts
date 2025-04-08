import { Transaction, User } from '@prisma/client'
import { TransacitonsRepository } from '@/repositories/transactions-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { UsersRepository } from '@/repositories/users-repository'

interface TransferUseCaseRequest {
  payer_id: string
  value: Decimal
  payee: string
}

interface TransferUseCaseResponse {
  transaction: Transaction
  from: User
  to: User
}

export class TransferUseCase {
  constructor(
    private transactionsRepository: TransacitonsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    payer_id,
    value,
    payee,
  }: TransferUseCaseRequest): Promise<TransferUseCaseResponse> {
    const transaction = await this.transactionsRepository.atomicTransaction(
      payer_id,
      value,
      payee,
    )
    const from = await this.usersRepository.findById(payer_id)
    if (!from) {
      throw new Error('Payer not found')
    }

    const to = await this.usersRepository.findById(payee)
    if (!to) {
      throw new Error('Payee not found')
    }

    return {
      transaction,
      from,
      to,
    }
  }
}
