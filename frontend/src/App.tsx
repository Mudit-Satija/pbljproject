import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RoomPage } from './pages/RoomPage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:code" element={<RoomPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster
        position="bottom-center"
        gap={8}
        toastOptions={{
          style: {
            background: '#1b1a16',
            color: '#f6f2e8',
            border: '1px solid rgba(246, 242, 232, 0.14)',
            borderRadius: '12px',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '13px',
          },
        }}
      />
    </>
  )
}
