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
import { makeGetUserUseCase } from '@/use-cases/factories/make-get-user-use-case'

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
    await makeTransferUseCase.execute({
      payerId: request.user.sub,
      value,
      payeeId,
    })
    try {
      const makeGetUser = makeGetUserUseCase()
      const payer = await makeGetUser.execute({ userId: request.user.sub })
      const payee = await makeGetUser.execute({ userId: payeeId })

      await sendNotification(payer.user.cpf_cnpj, payee.user.phone)
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
