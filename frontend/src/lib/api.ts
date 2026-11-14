import axios from 'axios'

export interface Room {
  code: string
  content: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  revision: number
}

export const MAX_CONTENT_LENGTH = 200_000

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
})

export async function createRoom(): Promise<Room> {
  const { data } = await api.post<Room>('/rooms')
  return data
}

export async function getRoom(code: string): Promise<Room> {
  const { data } = await api.get<Room>(`/rooms/${encodeURIComponent(code)}`)
  return data
}

export async function saveRoomContent(code: string, content: string): Promise<Room> {
  const { data } = await api.put<Room>(`/rooms/${encodeURIComponent(code)}`, { content })
  return data
}

export function isRoomNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    if (message) {
      return message
    }
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.'
    }
    if (!error.response) {
      return "Can't reach the ClipSync server."
    }
  }
  return 'Something went wrong. Please try again.'
}
