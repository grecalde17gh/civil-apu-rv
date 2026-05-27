import { prisma } from './prisma'
import type { Project } from '@prisma/client'
import type { ProjectFormInput } from '@/src/lib/validations/project'

export async function getProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getProjectById(id: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id },
  })
}

export async function createProject(data: ProjectFormInput): Promise<Project> {
  return prisma.project.create({
    data: {
      name: data.name,
      clientName: data.clientName ?? undefined,
      location: data.location ?? undefined,
      province: data.province ?? undefined,
      city: data.city ?? undefined,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      defaultIndirectPercentage: data.defaultIndirectPercentage,
      notes: data.notes ?? undefined,
      status: data.status,
    },
  })
}

export async function updateProject(id: string, data: ProjectFormInput): Promise<Project> {
  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      clientName: data.clientName ?? undefined,
      location: data.location ?? undefined,
      province: data.province ?? undefined,
      city: data.city ?? undefined,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      defaultIndirectPercentage: data.defaultIndirectPercentage,
      notes: data.notes ?? undefined,
      status: data.status,
    },
  })
}
