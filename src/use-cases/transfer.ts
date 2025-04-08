import { Transaction } from '@prisma/client'
import { TransacitonsRepository } from '@/repositories/transactions-repository'
import { Decimal } from '@prisma/client/runtime/library'

interface TransferUseCaseRequest {
  payer_id: string
  value: Decimal
  payee: string
}

interface TransferUseCaseResponse {
  transaction: Transaction
}

export class TransferUseCase {
  constructor(private transactionsRepository: TransacitonsRepository) {}

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

    return {
      transaction,
    }
  }
}
