import { useEffect, useState } from 'react'

const STORAGE = {
  API: 'ai_grammar_api',
  MODEL: 'ai_grammar_model',
}

export default function SettingsModal({ open, onClose }:{ open:boolean, onClose:()=>void }){
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')

  useEffect(()=>{
    if(open){
      setApiKey(localStorage.getItem(STORAGE.API) || '')
      setModel(localStorage.getItem(STORAGE.MODEL) || 'gpt-4o-mini')
    }
  },[open])

  function save(){
    localStorage.setItem(STORAGE.API, apiKey.trim())
    localStorage.setItem(STORAGE.MODEL, model)
    onClose()
  }
  function clear(){
    localStorage.removeItem(STORAGE.API)
    localStorage.removeItem(STORAGE.MODEL)
    setApiKey('')
    setModel('gpt-4o-mini')
  }

  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Cài đặt API</h3>
          <button onClick={onClose} className="text-slate-400">✕</button>
        </div>
        <label className="text-xs text-slate-400">OpenAI API Key</label>
        <input value={apiKey} onChange={e=> setApiKey(e.target.value)} type="password" placeholder="sk-..." className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
        <label className="text-xs text-slate-400 mt-3 block">Model</label>
        <select value={model} onChange={e=> setModel(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none">
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
        </select>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">Lưu</button>
          <button onClick={clear} className="px-3 py-2 rounded-lg border border-white/10">Xóa</button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Khóa API được lưu cục bộ trong trình duyệt của bạn.</p>
      </div>
    </div>
  )
}


