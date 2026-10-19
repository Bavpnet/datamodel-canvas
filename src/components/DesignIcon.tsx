export function DesignIcon({ name, className = '' }: { name: string; className?: string }) {
  return <i aria-hidden="true" className={`design-icon ${name === 'divider' ? 'design-divider' : ''} ${className}`} style={{ maskImage: `url(/figma/${name}.svg)`, WebkitMaskImage: `url(/figma/${name}.svg)` }} />
}
