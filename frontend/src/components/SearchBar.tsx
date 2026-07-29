import { Search, LocateFixed } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onLocate?: () => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, onLocate, placeholder }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Rechercher une station</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pulvis-muted" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Ville, quartier ou lieu…'}
          className="w-full rounded-full border border-white/15 bg-pulvis-bgLight py-3.5 pl-11 pr-4 text-sm text-pulvis-cream placeholder:text-pulvis-muted focus:border-pulvis-gold focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={onLocate}
        className="flex items-center justify-center gap-2 rounded-full border border-pulvis-gold/40 px-5 py-3.5 text-sm text-pulvis-cream transition-colors hover:border-pulvis-gold hover:bg-pulvis-gold/10"
      >
        <LocateFixed className="h-4 w-4" />
        Me géolocaliser
      </button>
    </div>
  )
}
