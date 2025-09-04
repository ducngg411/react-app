import { useMemo, useState } from 'react'
import { deleteLessonByTitle, exportLesson, findLessonByTitle, getLessons, setCurrentLesson } from '../utils/storage'
import { Link } from 'react-router-dom'

export default function Library(){
  const [term, setTerm] = useState('')
  const lessons = useMemo(()=> (getLessons() as any[]).sort((a,b)=> (b.createdAt||0)-(a.createdAt||0)), [])
  const filtered = lessons.filter(l=> !term || (l.title||'').toLowerCase().includes(term.toLowerCase()))
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl border border-white/10 bg-slate-900">
        <h3 className="font-semibold">Bài học của tôi</h3>
        <input value={term} onChange={e=> setTerm(e.target.value)} placeholder="Tìm theo tên bài học" className="mt-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((l:any,i:number)=> (
          <div key={i} className="p-3 rounded-xl border border-white/10 bg-slate-900">
            <h4 className="font-semibold">{l.title}</h4>
            <p className="text-xs text-slate-400">Level: {l.level || '-'} • {l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</p>
            <div className="mt-3 flex gap-2">
              <Link to={'/'} onClick={()=> setCurrentLesson(l)} className="px-3 py-2 rounded-lg border border-white/10">Mở</Link>
              <button onClick={()=> exportLesson(l)} className="px-3 py-2 rounded-lg border border-white/10">Xuất</button>
              <button onClick={()=> { deleteLessonByTitle(l.title); window.location.reload() }} className="px-3 py-2 rounded-lg border border-red-400 text-red-300">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


