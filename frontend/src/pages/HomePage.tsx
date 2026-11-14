import { ArrowRight, Clock3, Loader2, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SiteHeader } from '../components/SiteHeader'
import { apiErrorMessage, createRoom } from '../lib/api'

const STEPS = [
  {
    number: '01',
    title: 'Create a room',
    body: 'One click gives you a temporary eight-character code.',
  },
  {
    number: '02',
    title: 'Drop in your text',
    body: 'Type or paste. Every change saves automatically as you go.',
  },
  {
    number: '03',
    title: 'Open it anywhere',
    body: 'Enter the same code on another device. Copy and carry on.',
  },
]

function cleanCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
}

export function HomePage() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  async function handleCreate() {
    if (creating) return

    setCreating(true)
    try {
      const room = await createRoom()
      navigate(`/room/${room.code}`)
    } catch (error) {
      toast.error(apiErrorMessage(error))
      setCreating(false)
    }
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (joinCode.length !== 8) {
      toast.error('Room codes are eight characters long.')
      return
    }
    navigate(`/room/${joinCode}`)
  }

  return (
    <div className="paper-dots flex min-h-screen flex-col bg-paper">
      <SiteHeader>
        <a
          href="#how-it-works"
          className="text-xs font-medium text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
        >
          How it works
        </a>
      </SiteHeader>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <section className="grid grid-cols-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
            <div>
              <p className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">
                <span className="h-px w-7 bg-ink/25" aria-hidden="true" />
                Shared clipboard · zero setup
              </p>

              <h1 className="mt-5 text-[2.85rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.35rem]">
                Paste once.
                <br />
                Pick it up{' '}
                <span className="font-serif font-normal italic tracking-[-0.01em]">anywhere.</span>
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft sm:text-base">
                ClipSync is a tiny shared clipboard for your phone, laptop, and that borrowed
                desktop. Create a room, drop in your text, then open the same code on the other
                screen.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  No account needed
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" aria-hidden="true" />
                  Rooms vanish after 24h
                </span>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border border-ink/10 bg-accent/50"
              />
              <div className="relative rounded-[26px] border border-ink/15 bg-[#fffdf8] p-6 shadow-card sm:p-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                  Start here
                </p>
                <h2 className="mt-2 text-[1.65rem] font-medium tracking-[-0.03em]">
                  Create a clipboard room
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  You&apos;ll get an eight-character code. Share it, or type it on your other
                  device.
                </p>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="mt-6 flex w-full items-center justify-between rounded-xl bg-ink px-5 py-3.5 text-[15px] font-medium text-paper transition hover:bg-ink/90 disabled:cursor-wait disabled:opacity-70"
                >
                  <span>{creating ? 'Creating room…' : 'Create a room'}</span>
                  {creating ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <span className="grid size-6 place-items-center rounded-full bg-accent text-ink">
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  )}
                </button>

                <div className="my-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  or join one
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </div>

                <form onSubmit={handleJoin}>
                  <label htmlFor="room-code" className="text-sm font-medium">
                    Already have a code?
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="room-code"
                      value={joinCode}
                      onChange={(event) => setJoinCode(cleanCode(event.target.value))}
                      placeholder="K7M2P9RX"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      maxLength={8}
                      className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-paper/60 px-4 font-mono text-[15px] uppercase tracking-[0.2em] text-ink placeholder:tracking-[0.16em] placeholder:text-ink-soft/45 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/70 focus-visible:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Open room"
                      className="grid size-12 shrink-0 place-items-center rounded-xl border border-ink/15 bg-accent text-ink transition hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0"
                    >
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">
                    Eight letters and numbers, like <span className="font-mono">K7M2P9RX</span>.
                  </p>
                </form>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="scroll-mt-20 border-t border-line py-10 sm:py-12">
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
              {STEPS.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <span className="pt-0.5 font-mono text-[11px] text-ink-soft">{step.number}</span>
                  <div>
                    <h3 className="text-sm font-medium tracking-[-0.01em]">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>A small clipboard for moving text between screens.</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
            Rooms self-destruct after 24h
          </p>
        </div>
      </footer>
    </div>
  )
}
