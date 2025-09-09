import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import apiService from '../services/api'

export default function Library(){
  const [term, setTerm] = useState('')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Authentication guard
  useEffect(() => {
    if (!isAuthenticated) {
      toast.show('Vui lòng đăng nhập để xem thư viện bài học')
      // Stay on library page but show login prompt
    }
  }, [isAuthenticated, toast])

  // Load lessons when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadLessons()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMyLessons({ limit: 100 })
      if (response.success) {
        setLessons(response.data.lessons)
      } else {
        setError(response.message)
      }
    } catch (error) {
      setError('Có lỗi khi tải danh sách bài học')
      console.error('Load lessons error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (lessonId) => {
    try {
      const response = await apiService.deleteLesson(lessonId)
      if (response.success) {
        toast.show('Đã xóa bài học')
        loadLessons() // Reload the list
      } else {
        toast.show('Xóa bài học thất bại: ' + response.message)
      }
    } catch (error) {
      toast.show('Có lỗi khi xóa bài học')
      console.error('Delete lesson error:', error)
    }
  }

  const exportLesson = (lesson) => {
    const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(lesson.title || 'lesson').replace(/[^a-z0-9-_]+/gi,'_')}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const filtered = lessons.filter(l=> !term || (l.title||'').toLowerCase().includes(term.toLowerCase()))

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Vui lòng đăng nhập</h3>
          <p className="text-slate-500">Bạn cần đăng nhập để xem bài học của mình</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Đang tải danh sách bài học...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <button 
            onClick={loadLessons}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl border border-white/10 bg-slate-900">
        <h3 className="font-semibold">Bài học của tôi</h3>
        <input value={term} onChange={e=> setTerm(e.target.value)} placeholder="Tìm theo tên bài học" className="mt-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((l,i)=> (
          <div key={i} className="p-3 rounded-xl border border-white/10 bg-slate-900">
            <h4 className="font-semibold">{l.title}</h4>
            <p className="text-xs text-slate-400">Level: {l.level || '-'} • {l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</p>
            <div className="mt-3 flex gap-2">
              <Link to={`/?lessonId=${l._id}`} className="px-3 py-2 rounded-lg border border-white/10">Mở</Link>
              <button onClick={()=> exportLesson(l)} className="px-3 py-2 rounded-lg border border-white/10">Xuất</button>
              <button onClick={()=> deleteLesson(l._id)} className="px-3 py-2 rounded-lg border border-red-400 text-red-300">Xóa</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Chưa có bài học nào</h3>
          <p className="text-slate-500">Hãy tạo bài học đầu tiên của bạn!</p>
        </div>
      )}
    </div>
  )
}


