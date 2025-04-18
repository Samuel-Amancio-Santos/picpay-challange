import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserUncheckedCreateInput): Promise<User>
  findCredentials(credential: string): Promise<User | null>
}
