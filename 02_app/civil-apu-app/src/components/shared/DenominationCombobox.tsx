'use client'

import { useMemo, useState } from 'react'
import { filterCatalogOptions, type CatalogSearchOption } from '@/src/lib/catalogSearch'

type DenominationComboboxProps = {
  name?: string
  options: CatalogSearchOption[]
  initialId?: string
  placeholder?: string
}

export default function DenominationCombobox({
  name = 'denominationId',
  options,
  initialId = '',
  placeholder = 'Buscar denominacion IPCO',
}: DenominationComboboxProps) {
  const initial = options.find((option) => option.id === initialId)
  const [query, setQuery] = useState(initial?.label ?? '')
  const [selectedId, setSelectedId] = useState(initialId)
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((option) => option.id === selectedId)
  const filteredOptions = useMemo(() => filterCatalogOptions(options, query, 40), [options, query])

  function selectOption(option: CatalogSearchOption) {
    setSelectedId(option.id)
    setQuery(option.label)
    setIsOpen(false)
  }

  function clearSelection() {
    setSelectedId('')
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <div className="mt-1 flex gap-2">
        <input
          type="search"
          value={query}
          placeholder={placeholder}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120)
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelectedId('')
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="h-9 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950"
        />
        <button
          type="button"
          onClick={clearSelection}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          Limpiar
        </button>
      </div>

      {selected ? <p className="mt-1 truncate text-xs font-medium text-blue-800">{selected.label}</p> : null}

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded border border-zinc-300 bg-white shadow-lg">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">No hay denominaciones que coincidan.</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectOption(option)
                }}
                className="block w-full px-3 py-2 text-left text-xs text-zinc-800 transition hover:bg-blue-50 hover:text-blue-950"
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

