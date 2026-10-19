import { DesignIcon } from './DesignIcon'
type IconProps = {
  className?: string
}

export function TableIcon({ className }: IconProps) {
  return (
    <svg className={`ui-icon ${className ?? ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 6.5h12M8 6.5v6.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function TextIcon({ className }: IconProps) {
  return <DesignIcon name="panel-type" className={className} />
}

export function NumberIcon({ className }: IconProps) {
  return <DesignIcon name="panel-hash" className={className} />
}
export function DateIcon({ className }: IconProps) {
  return <DesignIcon name="panel-calendar" className={className} />
}

export function CalcIcon({ className }: IconProps) {
  return <DesignIcon name="panel-calculator" className={className} />
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={`ui-icon ${className ?? ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.2 10.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={`ui-icon ${className ?? ''}`} width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M4 5.5 7 8.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function KindIcon({ kind, className }: { kind: 'text' | 'number' | 'date' | 'calc'; className?: string }) {
  if (kind === 'number') return <NumberIcon className={className} />
  if (kind === 'date') return <DateIcon className={className} />
  if (kind === 'calc') return <CalcIcon className={className} />
  return <TextIcon className={className} />
}
