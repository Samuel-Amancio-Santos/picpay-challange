import { Prisma, Role, User } from '@prisma/client'
import { UsersRepository } from '../users-repository'
import { randomUUID } from 'crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

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

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      cpf_cnpj: data.cpf_cnpj,
      role: data.role ?? Role.USER,
      walletBalance: Prisma.Decimal(Number(data.walletBalance)) ?? 0,
      phone: data.phone,
      created_at: new Date(),
    }
    this.items.push(user)

    return user
  }
}
