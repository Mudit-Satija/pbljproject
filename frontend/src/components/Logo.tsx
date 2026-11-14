import { Clipboard } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="ClipSync home">
      <span className="grid size-9 place-items-center rounded-[11px] border border-ink/20 bg-accent text-ink shadow-[2px_2px_0_0_var(--color-ink)] transition-transform duration-200 group-hover:-rotate-6">
        <Clipboard className="size-[17px]" strokeWidth={2.3} aria-hidden="true" />
      </span>
      <span className="hidden text-[17px] font-semibold tracking-[-0.02em] min-[360px]:inline">
        ClipSync
      </span>
    </Link>
  )
}
