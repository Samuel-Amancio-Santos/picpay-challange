import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UserAlreadyExistsError } from '@/use-cases/err/user-already-exists-error'
import { makeRegisterUsersUseCase } from '@/use-cases/factories/make-register-use-case'
import { CpfOrCnpjAlreadyExistsError } from '@/use-cases/err/cpf-or-cnpj-error'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const RoleEnum = z.enum(['USER', 'SELLER'])
  const registerUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    user_cpf_cnpj: z.string(),
    password: z.string().min(6),
    role: RoleEnum,
  })

  const { name, email, password, user_cpf_cnpj, role } =
    registerUserBodySchema.parse(request.body)

  try {
    const registerUseCase = makeRegisterUsersUseCase()
    await registerUseCase.execute({
      name,
      email,
      user_cpf_cnpj,
      password,
      role,
    })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }
    if (err instanceof CpfOrCnpjAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }

  return reply.status(201).send()
}
