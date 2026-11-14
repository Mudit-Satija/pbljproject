export function formatClockTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTimeLeft(expiresAt: string): string {
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (remaining <= 0) {
    return 'a moment'
  }

  const totalMinutes = Math.ceil(remaining / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${minutes}m`
}
