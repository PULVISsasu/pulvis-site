interface SectionTitleProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionTitleProps) {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left'

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment} ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">{description}</p>
      )}
    </div>
  )
}
