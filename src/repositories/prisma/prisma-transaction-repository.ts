import { Transaction, User, Wallet } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TransacitonsRepository } from '../transactions-repository'
import { ValueMustBeGreaterThanZero } from '@/use-cases/err/value-must-be-greater-than-zero'
import { NoCreditsError } from '@/use-cases/err/no-credits-error'
import { UnauthorizedError } from '@/use-cases/err/unauthorizedError '
import { Decimal } from '@prisma/client/runtime/library'
import { PayeeNotFound } from '@/use-cases/err/payee-not-found'

export class PrismaTransactionsRepository implements TransacitonsRepository {
  atomicTransaction(
    payerId: string,
    value: Decimal,
    payeeId: string,
  ): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      const [payer] = await tx.$queryRaw<User[]>`
         SELECT * FROM "users" WHERE id = ${payerId} FOR UPDATE `

      const [payerWallet] = await tx.$queryRaw<Wallet[]>`
         SELECT * FROM "wallets" WHERE user_id = ${payerId} FOR UPDATE `

      if (!payer || payer.role !== 'USER' || payer.id === payeeId) {
        throw new UnauthorizedError()
      }

      if (value.lte(0)) {
        throw new ValueMustBeGreaterThanZero()
      }

      if (payerWallet.amount.sub(value).lt(0)) {
        throw new NoCreditsError()
      }

      const payee = await tx.user.findFirst({
        where: {
          id: payeeId,
        },
      })

      if (!payee) {
        throw new PayeeNotFound()
      }

      await tx.wallet.update({
        where: { id: payerWallet.id },
        data: {
          amount: { decrement: value },
        },
      })

      await tx.wallet.update({
        where: { user_id: payee?.id },
        data: {
          amount: { increment: value },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          payer_sender_id: payer.id,
          payee_received_id: payeeId,
          value,
        },
      })

      return transaction
    })
  }
}
