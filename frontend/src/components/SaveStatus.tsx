import { AlertCircle, Check, Loader2 } from 'lucide-react'
import type { SaveState } from '../hooks/useRoomSync'
import { formatClockTime } from '../lib/format'

export function SaveStatus({
  state,
  savedAt,
}: {
  state: SaveState
  savedAt?: string | null
}) {
  if (state === 'error') {
    return (
      <span id="save-status" aria-live="polite" className="inline-flex items-center gap-1.5">
        <AlertCircle className="size-3.5 text-[#b0442f]" aria-hidden="true" />
        <span className="text-[#b0442f]">Couldn&apos;t save — retrying</span>
      </span>
    )
  }

  if (state === 'saved') {
    return (
      <span id="save-status" aria-live="polite" className="inline-flex items-center gap-1.5">
        <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
        <span>Saved{savedAt ? ` at ${formatClockTime(savedAt)}` : ''}</span>
      </span>
    )
  }

  return (
    <span id="save-status" aria-live="polite" className="inline-flex items-center gap-1.5">
      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      <span>Saving…</span>
    </span>
  )
}
