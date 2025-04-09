import { Transaction } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface TransacitonsRepository {
  atomicTransaction(
    payerId: string,
    value: Decimal,
    payeeId: string,
  ): Promise<Transaction>
}
