import { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { verifyJwt } from '../../middlewares/verify-jwt'
import { refresh } from './refresh'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { transfer } from './transfer'
import { verifyTransactionAuthorization } from '@/http/middlewares/verify-transaction-authorization'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/login', authenticate)
  app.patch('/token/refresh', refresh)

  /** Authenticated */
  app.post(
    '/users/transfer/:payeeId',
    {
      onRequest: [
        verifyJwt,
        verifyUserRole('USER'),
        verifyTransactionAuthorization,
      ],
    },
    transfer,
  )
}
