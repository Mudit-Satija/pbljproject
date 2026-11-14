import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { copyToClipboard } from '../lib/clipboard'

export function RoomCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2_000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await copyToClipboard(code)
      setCopied(true)
      toast.success('Room code copied')
    } catch {
      toast.error('Copy was blocked. Copy the code manually from the page.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy room code ${code}`}
      className="group inline-flex h-9 items-center gap-2 rounded-lg border border-ink/15 bg-white/60 px-3 font-mono text-[12px] tracking-[0.16em] text-ink transition hover:border-ink/30 hover:bg-white sm:text-[13px] sm:tracking-[0.18em]"
    >
      <span>{code}</span>
      {copied ? (
        <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5 text-ink-soft transition group-hover:text-ink" aria-hidden="true" />
      )}
    </button>
  )
}
