import { Transaction } from '@prisma/client'
import { TransacitonsRepository } from '@/repositories/transactions-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { UsersRepository } from '@/repositories/users-repository'
import { sendNotification } from '@/utils/twlio'

interface TransferUseCaseRequest {
  payer_id: string
  value: Decimal
  payee: string
}

interface TransferUseCaseResponse {
  transaction: Transaction
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

    const payer = await this.usersRepository.findById(payer_id)
    await sendNotification(payer?.cpf_cnpj ?? '')

    return {
      transaction,
    }
  }
}
