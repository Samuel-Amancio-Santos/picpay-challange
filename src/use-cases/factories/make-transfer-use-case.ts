import { TransferUseCase } from '../transfer'
import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transaction-repository'

export function makeTransferUsersUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()

  const transferUseCase = new TransferUseCase(transactionsRepository)

  return transferUseCase
}
