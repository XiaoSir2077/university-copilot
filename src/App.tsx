import { Navigate, Route, Routes } from 'react-router'
import Home from './pages/Home'
import Brother from './pages/Brother'
import Aunt from './pages/Aunt'
import Login from './pages/Login'
import BookPage from './pages/BookPage'
import { useAuth } from './store/useBoard'

export default function App() {
  const { currentUser } = useAuth()

  if (!currentUser) return <Login />

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser.id === 'u-jiujiu' ? <Navigate to="/aunt" replace /> : <Home />}
      />
      <Route path="/book/:bookId" element={<BookPage />} />
      <Route
        path="/brother"
        element={currentUser.role === 'admin' ? <Brother /> : <Navigate to="/" replace />}
      />
      <Route
        path="/aunt"
        element={currentUser.id === 'u-jiujiu' ? <Aunt /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
