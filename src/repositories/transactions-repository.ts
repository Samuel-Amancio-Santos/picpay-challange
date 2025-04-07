import { Transaction } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface TransacitonsRepository {
  atomicTransaction(
    user_id: string,
    value: Decimal,
    payee: string,
  ): Promise<Transaction>
}
