import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import SettingsModal from '../components/SettingsModal'

export default function App(){
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 grid place-items-center font-extrabold text-white shadow-md ring-2 ring-indigo-500/20">AI</div>
            <div>
              <h1 className="text-base font-semibold text-slate-800">Grammar Studio</h1>
              <p className="text-xs text-slate-600">Thiết kế bài học bằng AI</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/" className={`px-3 py-1.5 rounded-full border transition-all duration-200 ${pathname==='/'?'bg-indigo-600 text-white border-indigo-500 shadow-sm':'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}>Tạo bài học mới</Link>
            <Link to="/library" className={`px-3 py-1.5 rounded-full border transition-all duration-200 ${pathname.startsWith('/library')?'bg-indigo-600 text-white border-indigo-500 shadow-sm':'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}>Bài học của tôi</Link>
            <button onClick={()=> setOpen(true)} className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200">Cài đặt</button>
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


