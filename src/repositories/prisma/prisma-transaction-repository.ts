import { Transaction, User } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TransacitonsRepository } from '../transactions-repository'
import { ValueMustBeGreaterThanZero } from '@/use-cases/err/value-must-be-greater-than-zero'
import { NoCreditsError } from '@/use-cases/err/no-credits-error'
import { UnauthorizedError } from '@/use-cases/err/unauthorizedError '
import { PayeeNotFound } from '@/use-cases/err/payee-not-found'
import { Decimal } from '@prisma/client/runtime/library'

export class PrismaTransactionsRepository implements TransacitonsRepository {
  atomicTransaction(
    payer_id: string,
    value: Decimal,
    payee: string,
  ): Promise<Transaction> {
    // Transação atomica caso qualquer erro ocorra, a transação é completamente desfeita.
    return prisma.$transaction(async (tx) => {
      // lock de linha, bloqueiam erros causados por transações simultâneas
      const [userPayer] = await tx.$queryRaw<User[]>` 
        SELECT * FROM "users" WHERE id = ${payer_id} FOR UPDATE
      `

      if (!userPayer || userPayer.role !== 'USER' || userPayer.id === payee) {
        throw new UnauthorizedError()
      }

      if (value.lte(0)) {
        throw new ValueMustBeGreaterThanZero()
      }

      if (userPayer.walletBalance.sub(value).lt(0)) {
        throw new NoCreditsError()
      }

      const payeeReceived = await tx.user.findUnique({
        where: {
          id: payee,
        },
      })

      if (!payeeReceived) {
        throw new PayeeNotFound()
      }

      await tx.user.update({
        where: { id: userPayer.id },
        data: {
          walletBalance: { decrement: value },
        },
      })

      await tx.user.update({
        where: { id: payeeReceived.id },
        data: {
          walletBalance: { increment: value },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          payer_sender_id: userPayer.id,
          payee_received_id: payeeReceived.id,
          value,
          from_cpf_cnpj: userPayer.cpf_cnpj,
          to_cpf_cnpj: payeeReceived.cpf_cnpj,
          to_phone: payeeReceived.phone,
        },
      })

      return transaction
    })
  }
}
