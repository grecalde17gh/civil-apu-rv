import { prisma } from './prisma'
import type { IpcoDenomination } from '@prisma/client'

export async function getIpcoDenominations(): Promise<IpcoDenomination[]> {
  return prisma.ipcoDenomination.findMany({
    orderBy: [{ name: 'asc' }],
  })
}

