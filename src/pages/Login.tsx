import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router'
import { GraduationCap, KeyRound, LogIn, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth, getCurrentUser } from '@/store/useBoard'

// 各账号登录后的默认落脚点
function homeOf(userId?: string) {
  if (userId === 'u-gege') return '/brother'
  if (userId === 'u-jiujiu') return '/aunt'
  return '/'
}

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 原型便利功能：?u=账号&p=密码 可直达登录（正式版移除）
  useEffect(() => {
    const u = params.get('u')
    const p = params.get('p')
    if (u && p) {
      void auth.login(u, p).then((err) => {
        if (err) return
        const user = getCurrentUser()
        // 保留目标路径；从默认首页登录时按账号分流到各自面板
        const target =
          location.pathname === '/'
            ? homeOf(user?.id)
            : location.pathname + location.search + location.hash
        navigate(target, { replace: true })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doLogin = async () => {
    setBusy(true)
    setError(null)
    const err = await auth.login(username, password)
    setBusy(false)
    if (err) setError(err)
    else navigate(homeOf(getCurrentUser()?.id), { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-rose-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-xl shadow-zinc-200">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-rose-200">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-800">
              University{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Copilot
              </span>
            </h1>
          </div>

          <div className="mt-7 flex flex-col gap-3">
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                placeholder="账号"
                autoComplete="username"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                placeholder="密码"
                autoComplete="current-password"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            {error && <p className="text-center text-xs text-rose-500">{error}</p>}
            <Button
              onClick={doLogin}
              disabled={busy}
              className="mt-1 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-medium hover:opacity-90"
            >
              <LogIn className="mr-1.5 h-4 w-4" /> {busy ? '登录中…' : '登 录'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
