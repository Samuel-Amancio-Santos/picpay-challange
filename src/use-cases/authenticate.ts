import { User } from '@prisma/client'
import { compare } from 'bcryptjs'
import { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from './err/invalid-credentials-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const userPasswordMatchs = await compare(password, user?.password_hash)

    if (!userPasswordMatchs) {
      throw new InvalidCredentialsError()
    }

    return {
      user,
    }
  }
}
