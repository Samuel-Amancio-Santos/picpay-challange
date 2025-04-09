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
    payeeId: z.string().uuid(),
  })

  const { payeeId } = transferPayeeParamsSchema.parse(request.params)

  const transferBodySchema = z.object({
    value: z.number().transform(Decimal),
  })

  const { value } = transferBodySchema.parse(request.body)

  try {
    const makeTransferUseCase = makeTransferUsersUseCase()
    const { transaction } = await makeTransferUseCase.execute({
      payerId: request.user.sub,
      value,
      payeeId,
    })
    try {
      await sendNotification(transaction.from_cpf_cnpj, transaction.to_phone)
      return reply
        .status(201)
        .send({ message: 'Transfer completed and notification sent.' })
    } catch (notificationError) {
      return reply.status(201).send({
        message:
          'Transfer completed successfully, but the notification service is currently unavailable. (Twilio live mode required).',
      })
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
}
