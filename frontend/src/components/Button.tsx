import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface BaseProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  className?: string
  icon?: ReactNode
}

interface ButtonAsLink extends BaseProps {
  to: string
  onClick?: never
  type?: never
}

interface ButtonAsButton extends BaseProps {
  to?: undefined
  onClick?: () => void
  type?: 'button' | 'submit'
}

type ButtonProps = ButtonAsLink | ButtonAsButton

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-300 ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pulvis-gold disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<NonNullable<BaseProps['variant']>, string> = {
  primary: 'bg-pulvis-gold text-pulvis-bg hover:bg-pulvis-goldSecondary',
  secondary:
    'border border-pulvis-gold/50 text-pulvis-cream hover:border-pulvis-gold hover:bg-pulvis-gold/10',
  ghost: 'text-pulvis-cream hover:text-pulvis-gold',
}

const sizes: Record<NonNullable<BaseProps['size']>, string> = {
  md: 'px-6 py-3 text-sm rounded-full',
  lg: 'px-8 py-4 text-sm sm:text-base rounded-full',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  to,
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
        {icon}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {icon}
    </button>
  )
}
