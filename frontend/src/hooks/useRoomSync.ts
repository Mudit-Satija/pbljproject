import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getRoom,
  isRoomNotFound,
  saveRoomContent,
  type Room,
} from '../lib/api'

export type LoadState = 'loading' | 'ready' | 'missing' | 'error'
export type SaveState = 'pending' | 'saving' | 'saved' | 'error'

const ROOM_CODE_PATTERN = /^[A-Z0-9]{8}$/
const SAVE_DELAY_MS = 700
const POLL_INTERVAL_MS = 2_500
const RETRY_DELAY_MS = 4_000

export function useRoomSync(rawCode: string) {
  const code = rawCode.trim().toUpperCase()

  const [text, setText] = useState('')
  const [room, setRoom] = useState<Room | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [connected, setConnected] = useState(true)
  const [loadAttempt, setLoadAttempt] = useState(0)

  const textRef = useRef('')
  const savedTextRef = useRef('')
  const syncedRevisionRef = useRef(0)
  const saveInFlightRef = useRef(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (!ROOM_CODE_PATTERN.test(code)) {
      setLoadState('missing')
      return
    }

    let cancelled = false
    setLoadState('loading')

    getRoom(code)
      .then((fetched) => {
        if (cancelled) return

        textRef.current = fetched.content
        savedTextRef.current = fetched.content
        syncedRevisionRef.current = fetched.revision
        setText(fetched.content)
        setRoom(fetched)
        setSaveState('saved')
        setConnected(true)
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadState(isRoomNotFound(error) ? 'missing' : 'error')
        setConnected(false)
      })

    return () => {
      cancelled = true
    }
  }, [code, loadAttempt])

  const flush = useCallback(async () => {
    if (saveInFlightRef.current) {
      return
    }

    saveInFlightRef.current = true
    try {
      // Save in a loop so edits made while a request is in flight are never lost.
      while (textRef.current !== savedTextRef.current) {
        const contentToSave = textRef.current
        setSaveState('saving')

        try {
          const updated = await saveRoomContent(code, contentToSave)
          savedTextRef.current = contentToSave
          syncedRevisionRef.current = updated.revision
          setRoom(updated)
          setConnected(true)
          setSaveState(textRef.current === contentToSave ? 'saved' : 'pending')
        } catch (error) {
          if (isRoomNotFound(error)) {
            setLoadState('missing')
          } else {
            setSaveState('error')
            setConnected(false)
          }
          break
        }
      }
    } finally {
      saveInFlightRef.current = false
    }
  }, [code])

  useEffect(() => {
    if (loadState !== 'ready' || text === savedTextRef.current) {
      return
    }

    setSaveState('pending')
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      void flush()
    }, SAVE_DELAY_MS)

    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [text, loadState, flush])

  useEffect(() => {
    if (saveState !== 'error') {
      return
    }

    // Keep retrying while the network or server is unavailable.
    const retry = window.setInterval(() => {
      void flush()
    }, RETRY_DELAY_MS)

    return () => window.clearInterval(retry)
  }, [saveState, flush])

  useEffect(() => {
    if (loadState !== 'ready') {
      return
    }

    let cancelled = false
    let requestInFlight = false

    const interval = window.setInterval(async () => {
      if (cancelled || requestInFlight || document.hidden) {
        return
      }

      requestInFlight = true
      try {
        const latest = await getRoom(code)
        if (cancelled) return

        setConnected(true)

        // Revisions make it safe to ignore slower, older poll responses.
        if (latest.revision <= syncedRevisionRef.current) {
          return
        }

        // Local edits win while they are waiting to be saved.
        if (textRef.current !== savedTextRef.current) {
          return
        }

        syncedRevisionRef.current = latest.revision
        setRoom(latest)

        if (latest.content !== savedTextRef.current) {
          textRef.current = latest.content
          savedTextRef.current = latest.content
          setText(latest.content)
          setSaveState('saved')
        }
      } catch (error) {
        if (cancelled) return

        if (isRoomNotFound(error)) {
          setLoadState('missing')
        } else {
          setConnected(false)
        }
      } finally {
        requestInFlight = false
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [code, loadState])

  const updateText = useCallback((value: string) => {
    textRef.current = value
    setText(value)
  }, [])

  const saveNow = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    void flush()
  }, [flush])

  const retryLoad = useCallback(() => {
    setLoadAttempt((attempt) => attempt + 1)
  }, [])

  return {
    code,
    text,
    updateText,
    saveNow,
    room,
    loadState,
    saveState,
    connected,
    retryLoad,
  }
}
