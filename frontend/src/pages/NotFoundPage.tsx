import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="max-w-md text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">404</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em]">
            This page isn&apos;t in any room.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            The link may be wrong, or the room it pointed to has expired.
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to ClipSync
          </Link>
        </div>
      </main>
    </div>
  )
}
