import { Navigate, Route, Routes } from 'react-router'
import Home from './pages/Home'
import Brother from './pages/Brother'
import Login from './pages/Login'
import { useAuth } from './store/useBoard'

export default function App() {
  const { currentUser } = useAuth()

  if (!currentUser) return <Login />

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/brother"
        element={currentUser.role === 'admin' ? <Brother /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
