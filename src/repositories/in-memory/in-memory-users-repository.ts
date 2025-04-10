import { Prisma, Role, User } from '@prisma/client'
import { UsersRepository } from '../users-repository'
import { randomUUID } from 'crypto'
import { InMemoryWalletsRepository } from './in-memory-wallets-repository'
import { Decimal } from '@prisma/client/runtime/library'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  constructor(public inMemorWalletsRepository: InMemoryWalletsRepository) {}

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async findCredentials(cpf: string): Promise<User | null> {
    const user = this.items.find((item) => item.cpf_cnpj === cpf)

    if (!user) {
      return null
    }

    return user
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    const user = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      cpf_cnpj: data.cpf_cnpj,
      role: data.role ?? Role.USER,
      phone: data.phone,
      created_at: new Date(),
    }

    await this.inMemorWalletsRepository.create({
      user_id: user.id,
      amount: new Decimal(0),
    })

    this.items.push(user)

    return user
  }
}
