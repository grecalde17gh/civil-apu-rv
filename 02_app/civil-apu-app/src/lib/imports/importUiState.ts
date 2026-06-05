export type ImportUiState = {
  fileName: string | null
  previewRowsCount: number
  error: string | null
  message: string | null
  loadedMessage: string | null
}

export const emptyImportUiState: ImportUiState = {
  fileName: null,
  previewRowsCount: 0,
  error: null,
  message: null,
  loadedMessage: null,
}

export function hasImportUiState(state: ImportUiState): boolean {
  return Boolean(state.fileName || state.previewRowsCount > 0 || state.error || state.message || state.loadedMessage)
}

export function clearImportUiState(): ImportUiState {
  return { ...emptyImportUiState }
}
