import { Check, Copy, Plus, SearchX, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { SaveStatus } from '../components/SaveStatus'
import { SiteHeader } from '../components/SiteHeader'
import { RoomCodeButton } from '../components/RoomCodeButton'
import { useRoomSync } from '../hooks/useRoomSync'
import { MAX_CONTENT_LENGTH } from '../lib/api'
import { copyToClipboard } from '../lib/clipboard'
import { formatTimeLeft } from '../lib/format'

export function RoomPage() {
  const params = useParams()
  const code = (params.code ?? '').trim().toUpperCase()

  const {
    text,
    updateText,
    saveNow,
    room,
    loadState,
    saveState,
    connected,
    retryLoad,
  } = useRoomSync(code)

  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2_000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const expiresAt = room?.expiresAt

  useEffect(() => {
    if (!expiresAt) return

    const update = () => setTimeLeft(formatTimeLeft(expiresAt))
    update()

    const interval = window.setInterval(update, 30_000)
    return () => window.clearInterval(interval)
  }, [expiresAt])

  async function handleCopyAll() {
    if (!text.trim()) {
      toast.error('There is nothing to copy yet.')
      return
    }

    try {
      await copyToClipboard(text)
      setCopied(true)
      toast.success('Copied the whole clipboard')
    } catch {
      toast.error('Copy was blocked. Select the text and copy it manually.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader>
        {loadState === 'ready' && <RoomCodeButton code={code} />}
        <Link
          to="/"
          aria-label="Start a new room"
          className="grid size-9 place-items-center rounded-lg border border-line bg-white/40 text-ink-soft transition hover:border-ink/25 hover:text-ink"
        >
          <Plus className="size-4" aria-hidden="true" />
        </Link>
      </SiteHeader>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        {loadState === 'loading' && <RoomSkeleton />}
        {loadState === 'missing' && <MissingRoom code={code} />}
        {loadState === 'error' && <RoomError onRetry={retryLoad} />}

        {loadState === 'ready' && room && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                  Live room
                </p>
                <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-[2rem]">
                  Shared clipboard
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                  Anyone with the code can open and edit this room. Changes save automatically.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-line bg-white/50 px-3 py-1.5 text-xs text-ink-soft">
                <span
                  className={`size-1.5 rounded-full ${
                    connected ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'
                  }`}
                  aria-hidden="true"
                />
                {connected ? 'Live sync' : 'Reconnecting…'}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-ink/15 bg-[#fffdf8] shadow-card transition focus-within:border-ink/30">
              <textarea
                value={text}
                onChange={(event) => updateText(event.target.value)}
                onBlur={saveNow}
                maxLength={MAX_CONTENT_LENGTH}
                spellCheck={false}
                aria-label="Shared clipboard text"
                aria-describedby="save-status"
                placeholder={
                  'Paste or start typing…\n\nAnything you put here shows up on every device that opens this room.'
                }
                className="block h-[52vh] max-h-[560px] min-h-[280px] w-full resize-none bg-transparent px-5 py-5 text-[15.5px] leading-7 text-ink placeholder:text-ink-soft/45 focus:outline-none focus-visible:outline-none sm:px-6 sm:py-6"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper-deep/50 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                  <SaveStatus state={saveState} savedAt={room.updatedAt} />
                  <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
                  <span>{text.length.toLocaleString()} characters</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-paper transition hover:-translate-y-px hover:bg-ink/90 active:translate-y-0"
                >
                  {copied ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
                  {copied ? 'Copied' : 'Copy all'}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ink/20" aria-hidden="true" />
                Expires in {timeLeft}
              </span>
              <span>
                Room code <span className="font-mono tracking-[0.12em] text-ink">{room.code}</span>
              </span>
            </div>
          </>
        )}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-6 text-xs text-ink-soft sm:px-8">
        <p>Rooms and their text are permanently deleted 24 hours after creation.</p>
      </footer>
    </div>
  )
}

function RoomSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading room">
      <div className="h-3 w-20 rounded-full bg-line" />
      <div className="mt-3 h-8 w-56 rounded-lg bg-line" />
      <div className="mt-2 h-3 w-80 max-w-full rounded-full bg-line/80" />
      <div className="mt-8 h-[52vh] max-h-[560px] min-h-[280px] rounded-2xl border border-line bg-white/50" />
    </div>
  )
}

function MissingRoom({ code }: { code: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center sm:py-24">
      <div className="grid size-14 place-items-center rounded-2xl border border-ink/10 bg-white/60">
        <SearchX className="size-6 text-ink-soft" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
        No room with that code.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        We couldn&apos;t find{' '}
        <span className="font-mono tracking-wider text-ink">{code || 'that address'}</span>. Room
        codes live for 24 hours, so it may have expired. Check the code, or start a fresh room.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
      >
        Start a new room
      </Link>
    </div>
  )
}

function RoomError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center sm:py-24">
      <div className="grid size-14 place-items-center rounded-2xl border border-ink/10 bg-white/60">
        <WifiOff className="size-6 text-ink-soft" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
        Can&apos;t reach ClipSync.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        The server didn&apos;t answer. Check your connection and try again — your room is probably
        fine.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-7 inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white/70 px-4 py-2.5 text-sm font-medium transition hover:border-ink/30"
      >
        Try again
      </button>
    </div>
  )
}
