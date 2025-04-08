import { FastifyReply, FastifyRequest } from 'fastify'
import { makeTransferUsersUseCase } from '@/use-cases/factories/make-transfer-use-case'
import { ValueMustBeGreaterThanZero } from '@/use-cases/err/value-must-be-greater-than-zero'
import { UnauthorizedError } from '@/use-cases/err/unauthorizedError '
import { NoCreditsError } from '@/use-cases/err/no-credits-error'
import { PayeeNotFound } from '@/use-cases/err/payee-not-found'
import { UnexpectedError } from '@/use-cases/err/unexpected-error'

import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { sendNotification } from '@/utils/twlio'

export async function transfer(request: FastifyRequest, reply: FastifyReply) {
  const transferPayeeParamsSchema = z.object({
    payee: z.string(),
  })

  const { payee } = transferPayeeParamsSchema.parse(request.params)

  const transferBodySchema = z.object({
    value: z.number().transform(Decimal),
  })

  const { value } = transferBodySchema.parse(request.body)

  try {
    const makeTransferUseCase = makeTransferUsersUseCase()
    const { from, to } = await makeTransferUseCase.execute({
      payer_id: request.user.sub,
      value,
      payee,
    })
    if (makeTransferUseCase) {
      await sendNotification(from.cpf_cnpj, to.phone)
    }
  } catch (err) {
    if (err instanceof ValueMustBeGreaterThanZero) {
      return reply.status(409).send({ message: err.message })
    }
    if (err instanceof UnauthorizedError) {
      return reply.status(401).send({ message: err.message })
    }
    if (err instanceof NoCreditsError) {
      return reply.status(409).send({ message: err.message })
    }
    if (err instanceof PayeeNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    if (err instanceof UnexpectedError) {
      return reply.status(500).send({ message: err.message })
    }

    throw err
  }

  return reply.status(201).send()
}
