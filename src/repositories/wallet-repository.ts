import { Prisma, Wallet } from '@prisma/client'

export interface walletsRepository {
  create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet>
  findByUserId(userId: string): Promise<Wallet | null>
}
