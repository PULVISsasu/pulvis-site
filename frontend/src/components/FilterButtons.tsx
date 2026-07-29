interface FilterButtonsProps<T extends string> {
  options: T[]
  active: T
  onChange: (value: T) => void
}

export default function FilterButtons<T extends string>({
  options,
  active,
  onChange,
}: FilterButtonsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtres">
      {options.map((option) => {
        const isActive = option === active
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={`rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${
              isActive
                ? 'border-pulvis-gold bg-pulvis-gold text-pulvis-bg'
                : 'border-white/15 text-pulvis-muted hover:border-pulvis-gold/50 hover:text-pulvis-cream'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
