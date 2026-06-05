import { describe, expect, it } from 'vitest'
import { clearImportUiState, hasImportUiState } from '../importUiState'

describe('import UI state reset', () => {
  it('clears state after an import error', () => {
    const cleared = clearImportUiState()

    expect(cleared).toEqual({
      fileName: null,
      previewRowsCount: 0,
      error: null,
      message: null,
      loadedMessage: null,
    })
  })

  it('detects state that should allow loading a new file after cancel', () => {
    expect(hasImportUiState({ fileName: 'materiales.xlsx', previewRowsCount: 0, error: null, message: null, loadedMessage: null })).toBe(true)
    expect(hasImportUiState(clearImportUiState())).toBe(false)
  })

  it('allows selecting the same file after clear by returning a fresh empty state', () => {
    const firstClear = clearImportUiState()
    const secondClear = clearImportUiState()

    expect(firstClear).toEqual(secondClear)
    expect(firstClear).not.toBe(secondClear)
  })
})
