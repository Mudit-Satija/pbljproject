import type { ReactNode } from 'react'
import { Logo } from './Logo'

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-line/90">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        {children && <div className="flex items-center gap-2 sm:gap-3">{children}</div>}
      </div>
    </header>
  )
}
