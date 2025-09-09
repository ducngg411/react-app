import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SettingsModal from '../components/SettingsModal'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import UserProfileModal from '../components/UserProfileModal'

export default function App(){
  const { pathname } = useLocation()
  const [openSettings, setOpenSettings] = useState(false)
  const [openLogin, setOpenLogin] = useState(false)
  const [openRegister, setOpenRegister] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  
  const { user, isAuthenticated } = useAuth()

  // Auto-open login modal for protected routes when not authenticated
  useEffect(() => {
    const protectedRoutes = ['/create']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (!isAuthenticated && isProtectedRoute) {
      setOpenLogin(true)
    }
  }, [pathname, isAuthenticated])

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setOpenProfile(true)
    } else {
      setOpenLogin(true)
    }
  }

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
            {isAuthenticated ? (
              <>
                <Link to="/" className={`px-3 py-1.5 rounded-full border transition-all duration-200 ${pathname==='/'?'bg-indigo-600 text-white border-indigo-500 shadow-sm':'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}>Tạo bài học mới</Link>
                <Link to="/library" className={`px-3 py-1.5 rounded-full border transition-all duration-200 ${pathname.startsWith('/library')?'bg-indigo-600 text-white border-indigo-500 shadow-sm':'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}>Bài học của tôi</Link>
              </>
            ) : (
              <>
                <button onClick={() => setOpenLogin(true)} className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200">Tạo bài học mới</button>
                <button onClick={() => setOpenLogin(true)} className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200">Bài học của tôi</button>
              </>
            )}
            <button onClick={()=> setOpenSettings(true)} className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200">Cài đặt</button>
            <button onClick={handleAuthClick} className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-600">
                      {user?.profile?.firstName?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm">{user?.username || 'User'}</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {!isAuthenticated && pathname === '/' ? (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 grid place-items-center font-extrabold text-white text-2xl shadow-lg ring-4 ring-indigo-500/20 mx-auto mb-6">AI</div>
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Grammar Studio</h1>
                <p className="text-xl text-slate-600 mb-8">Thiết kế bài học ngữ pháp tiếng Anh bằng AI</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Tạo bài học thông minh</h3>
                  <p className="text-slate-600 text-sm">AI sẽ tạo ra bài học ngữ pháp phù hợp với trình độ của bạn</p>
                </div>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Lưu trữ bài học</h3>
                  <p className="text-slate-600 text-sm">Tất cả bài học được lưu trữ an toàn và có thể truy cập mọi lúc</p>
                </div>
                
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Học tập hiệu quả</h3>
                  <p className="text-slate-600 text-sm">Bài tập và ví dụ được tối ưu để giúp bạn học nhanh hơn</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setOpenLogin(true)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                >
                  Đăng nhập để bắt đầu
                </button>
                <p className="text-slate-500 text-sm">
                  Chưa có tài khoản? 
                  <button 
                    onClick={() => setOpenRegister(true)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full px-4 py-4">
            <Outlet />
          </div>
        )}
      </main>
      
      {/* Modals */}
      <SettingsModal open={openSettings} onClose={()=> setOpenSettings(false)} />
      <LoginModal 
        isOpen={openLogin} 
        onClose={()=> setOpenLogin(false)} 
        onSwitchToRegister={()=> { setOpenLogin(false); setOpenRegister(true); }}
      />
      <RegisterModal 
        isOpen={openRegister} 
        onClose={()=> setOpenRegister(false)} 
        onSwitchToLogin={()=> { setOpenRegister(false); setOpenLogin(true); }}
      />
      <UserProfileModal 
        isOpen={openProfile} 
        onClose={()=> setOpenProfile(false)} 
      />
    </div>
  )
}


