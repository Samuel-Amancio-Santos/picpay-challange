import { Prisma, Wallet } from '@prisma/client'
import { walletsRepository } from '../wallet-repository'
import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/library'

export class InMemoryWalletsRepository implements walletsRepository {
  public items: Wallet[] = []

  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.items.find((wallet) => wallet.user_id === userId) ?? null
  }

  async create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet> {
    const wallet = {
      id: randomUUID(),
      amount: new Decimal(Number(data.amount)),
      user_id: data.user_id,
      created_at: new Date(),
    }

    this.items.push(wallet)

    return wallet
  }
}
