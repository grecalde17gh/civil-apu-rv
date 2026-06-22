import { prisma } from './prisma'
import type { IpcoDenomination } from '@prisma/client'

export async function getIpcoDenominations(params: { includeInactive?: boolean } = {}): Promise<IpcoDenomination[]> {
  return prisma.ipcoDenomination.findMany({
    where: params.includeInactive ? undefined : { isActive: true },
    orderBy: [{ name: 'asc' }],
  })
}

export async function createIpcoDenomination(data: {
  code?: string | null
  name: string
  isActive?: boolean
}): Promise<IpcoDenomination> {
  return prisma.ipcoDenomination.create({
    data: {
      code: data.code?.trim() || undefined,
      name: data.name.trim(),
      isActive: data.isActive ?? true,
    },
  })
}

export async function updateIpcoDenomination(id: string, data: {
  code?: string | null
  name: string
  isActive?: boolean
}): Promise<IpcoDenomination> {
  return prisma.ipcoDenomination.update({
    where: { id },
    data: {
      code: data.code?.trim() || null,
      name: data.name.trim(),
      isActive: data.isActive ?? true,
    },
  })
}

export async function setIpcoDenominationActive(id: string, isActive: boolean): Promise<IpcoDenomination> {
  return prisma.ipcoDenomination.update({
    where: { id },
    data: { isActive },
  })
}
