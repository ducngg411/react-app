import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import SettingsModal from '../components/SettingsModal'

export default function App(){
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 grid place-items-center font-extrabold">AI</div>
            <div>
              <h1 className="text-base font-semibold">Grammar Studio</h1>
              <p className="text-xs text-slate-400">Thiết kế bài học bằng AI</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/" className={`px-3 py-1.5 rounded-full border ${pathname==='/'?'bg-slate-800 text-white':'text-slate-400 border-white/10'}`}>Tạo bài học mới</Link>
            <Link to="/library" className={`px-3 py-1.5 rounded-full border ${pathname.startsWith('/library')?'bg-slate-800 text-white':'text-slate-400 border-white/10'}`}>Bài học của tôi</Link>
            <button onClick={()=> setOpen(true)} className="px-3 py-1.5 rounded-full border border-white/10 text-slate-300">Cài đặt</button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto w-full px-4 py-4 flex-1">
        <Outlet />
      </main>
      <SettingsModal open={open} onClose={()=> setOpen(false)} />
    </div>
  )
}


