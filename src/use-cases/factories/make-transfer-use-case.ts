import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { TransferUseCase } from '../transfer'
import { PrismaTransactionsRepository } from '@/repositories/prisma/prisma-transaction-repository'

export function makeTransferUsersUseCase() {
  const transactionsRepository = new PrismaTransactionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const transferUseCase = new TransferUseCase(
    transactionsRepository,
    usersRepository,
  )

  return transferUseCase
}
