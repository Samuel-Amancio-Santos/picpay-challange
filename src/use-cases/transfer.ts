import { Transaction } from '@prisma/client'
import { TransacitonsRepository } from '@/repositories/transactions-repository'
import { Decimal } from '@prisma/client/runtime/library'

interface TransferUseCaseRequest {
  payerId: string
  value: Decimal
  payeeId: string
}

interface TransferUseCaseResponse {
  transaction: Transaction
}
export class TransferUseCase {
  constructor(private transactionsRepository: TransacitonsRepository) {}

  async execute({
    payerId,
    value,
    payeeId,
  }: TransferUseCaseRequest): Promise<TransferUseCaseResponse> {
    const transaction = await this.transactionsRepository.atomicTransaction(
      payerId,
      value,
      payeeId,
    )

    return {
      transaction,
    }
  }
}
