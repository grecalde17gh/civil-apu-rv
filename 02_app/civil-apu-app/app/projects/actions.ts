'use server'

import { redirect } from 'next/navigation'
import { createProject, updateProject } from '@/src/lib/db/projects'
import { validateProjectInput } from '@/src/lib/validations/project'

export async function createProjectAction(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = validateProjectInput(data)

  await createProject(parsed)
  redirect('/projects')
}

export async function updateProjectAction(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') {
    throw new Error('Invalid project id')
  }

  const data = Object.fromEntries(formData)
  const parsed = validateProjectInput(data)

  await updateProject(id, parsed)
  redirect('/projects')
}
