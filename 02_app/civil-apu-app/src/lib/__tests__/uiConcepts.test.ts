import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('Franklin conceptual UI rules', () => {
  it('does not ask for category in the rubro form and shows VAE instead', () => {
    const source = read('src/components/rubros/RubroForm.tsx')

    expect(source).not.toContain('name="category"')
    expect(source).toContain('VAE')
  })

  it('shows VAE instead of technical specification in the main budget items table', () => {
    const source = read('src/components/budgets/BudgetItemsTable.tsx')

    expect(source).toContain('VAE')
    expect(source).not.toContain('Especificacion')
    expect(source).not.toContain('Especificación')
  })

  it('does not expose Cat or Den flags in material and import UIs', () => {
    const materialForm = read('src/components/materials/MaterialForm.tsx')
    const materialPage = read('app/materials/page.tsx')
    const importPreview = read('src/components/imports/CatalogImportClient.tsx')
    const combined = `${materialForm}\n${materialPage}\n${importPreview}`

    expect(combined).not.toContain('Cat.1')
    expect(combined).not.toContain('Cat.2')
    expect(combined).not.toContain('Den.1')
    expect(combined).not.toContain('Den.2')
    expect(combined).not.toContain('usesCategory1')
    expect(combined).not.toContain('usesCategory2')
  })
})
