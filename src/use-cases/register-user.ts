import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { hash } from 'bcryptjs'
import { cnpj, cpf } from 'cpf-cnpj-validator'
import { UserAlreadyExistsError } from './err/user-already-exists-error'
import { InvalidCredentialsError } from './err/invalid-credentials-error'
import { CpfOrCnpjAlreadyExistsError } from './err/cpf-or-cnpj-error'

interface RegisterUseCaseRequest {
  name: string
  email: string
  user_cpf_cnpj: string
  password: string
  role: 'USER' | 'SELLER'
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
    user_cpf_cnpj,
    role,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const isCredentialValid =
      cpf.isValid(user_cpf_cnpj) || cnpj.isValid(user_cpf_cnpj)

    if (!isCredentialValid) {
      throw new InvalidCredentialsError()
    }

    const userWithSameCredential =
      await this.usersRepository.findCredentials(user_cpf_cnpj)

    if (userWithSameCredential) {
      throw new CpfOrCnpjAlreadyExistsError()
    }

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
      cpf_cnpj: user_cpf_cnpj,
      walletBalance: 0,
      role,
    })

    return {
      user,
    }
  }
}
