import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyTransactionAuthorization(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const response = await fetch('https://util.devi.tools/api/v2/authorize', {
    method: 'GET',
  })

  if (response.status === 403) {
    return reply.status(403).send({ message: 'Transaction Unauthorized.' })
  }
}
