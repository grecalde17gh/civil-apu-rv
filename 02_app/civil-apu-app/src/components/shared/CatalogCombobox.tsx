'use client'

import { useMemo, useState } from 'react'
import { filterCatalogOptions, type CatalogSearchOption } from '@/src/lib/catalogSearch'

type CatalogComboboxProps = {
  name: string
  options: CatalogSearchOption[]
  placeholder: string
  emptyLabel: string
  required?: boolean
  maxResults?: number
}

export default function CatalogCombobox({
  name,
  options,
  placeholder,
  emptyLabel,
  required = true,
  maxResults = 25,
}: CatalogComboboxProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selected = options.find((option) => option.id === selectedId)
  const filteredOptions = useMemo(() => filterCatalogOptions(options, query, maxResults), [maxResults, options, query])

  function selectOption(option: CatalogSearchOption) {
    if (option.disabled) return
    setSelectedId(option.id)
    setQuery(option.label)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedId} required={required} />
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
        className="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm text-slate-950"
      />

      {selected ? <p className="mt-1 truncate text-[11px] font-medium text-blue-800">{selected.label}</p> : null}

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded border border-slate-300 bg-white shadow-lg">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">{emptyLabel}</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={option.disabled}
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectOption(option)
                }}
                className={`block w-full px-3 py-2 text-left text-xs transition ${
                  option.disabled
                    ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                    : 'text-slate-800 hover:bg-blue-50 hover:text-blue-950'
                }`}
              >
                <span className="block font-medium">{option.label}</span>
                {option.disabledReason ? <span className="mt-0.5 block text-[11px]">{option.disabledReason}</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
