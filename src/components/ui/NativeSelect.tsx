import type { ComponentProps } from 'react'
import { DesignIcon } from '../DesignIcon'
import './NativeSelect.css'

/** shadcn-style native select, adapted to this project's plain CSS. */
export function NativeSelect({ className = '', children, ...props }: ComponentProps<'select'>) {
  return <div className="native-select-wrapper" data-slot="native-select-wrapper">
    <select {...props} className={`native-select ${className}`} data-slot="native-select">{children}</select>
    <DesignIcon name="down" className="native-select-chevron" />
  </div>
}
