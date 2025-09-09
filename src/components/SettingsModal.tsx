import { useEffect, useState } from 'react'

const STORAGE = {
  API: 'ai_grammar_api',
  MODEL: 'ai_grammar_model',
}

export default function SettingsModal({ open, onClose }:{ open:boolean, onClose:()=>void }){
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-5')

  useEffect(()=>{
    if(open){
      setApiKey(localStorage.getItem(STORAGE.API) || '')
      setModel(localStorage.getItem(STORAGE.MODEL) || 'gpt-5')
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
    setModel('gpt-5')
  }

  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Cài đặt API</h3>
          <button onClick={onClose} className="text-slate-400">✕</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">OpenAI API Key</label>
            <input value={apiKey} onChange={e=> setApiKey(e.target.value)} type="password" placeholder="sk-..." className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
          </div>
          
          <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
            <p className="text-xs text-green-300 font-medium">✅ Gemini API Key</p>
            <p className="text-xs text-green-200 mt-1">Đã được cấu hình trong file .env. Tất cả user sẽ dùng chung API key này.</p>
            <p className="text-xs text-green-200 mt-1">API Key: {(import.meta as any).env?.VITE_GEMINI_API_KEY ? '***' + (import.meta as any).env.VITE_GEMINI_API_KEY.slice(-4) : 'Chưa cấu hình'}</p>
          </div>
          
          <div>
            <label className="text-xs text-slate-400">Model</label>
            <select value={model} onChange={e=> setModel(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none">
              <option value="gpt-5">gpt-5 (Mới nhất)</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">GPT-5 là phiên bản mới nhất với khả năng xử lý đa phương tiện và hiểu ngữ cảnh tốt hơn.</p>
            <div className="mt-2 p-2 rounded-lg bg-yellow-600/20 border border-yellow-500/30">
              <p className="text-xs text-yellow-300 font-medium">⚠️ Lưu ý về Rate Limit</p>
              <p className="text-xs text-yellow-200 mt-1">Nếu gặp lỗi "Rate limit reached", hãy:</p>
              <ul className="text-xs text-yellow-200 mt-1 ml-4 list-disc">
                <li>Thêm phương thức thanh toán tại <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-300 underline">OpenAI Billing</a></li>
                <li>Hoặc chờ reset quota (thường là 24h)</li>
                <li>Hệ thống sẽ tự động thử model khác nếu một model bị rate limit</li>
                <li><strong>Fallback tự động:</strong> Nếu tất cả OpenAI models lỗi, hệ thống sẽ tự động chuyển sang Gemini</li>
              </ul>
            </div>
            <div className="mt-2 p-2 rounded-lg bg-purple-600/20 border border-purple-500/30">
              <p className="text-xs text-purple-300 font-medium">✨ Gemini Backup</p>
              <p className="text-xs text-purple-200 mt-1">Hệ thống tự động sử dụng Gemini 2.5 Flash khi:</p>
              <ul className="text-xs text-purple-200 mt-1 ml-4 list-disc">
                <li>Tất cả OpenAI models bị rate limit</li>
                <li>OpenAI models không khả dụng</li>
                <li>Lỗi kết nối với OpenAI</li>
              </ul>
              <p className="text-xs text-purple-200 mt-1">Model: <code className="bg-purple-700/30 px-1 rounded">gemini-2.5-flash</code> (mới nhất)</p>
              <p className="text-xs text-purple-200 mt-1">Bài học tạo bằng Gemini sẽ có badge "✨ Powered by Gemini"</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button onClick={save} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">Lưu</button>
          <button onClick={clear} className="px-3 py-2 rounded-lg border border-white/10">Xóa</button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Khóa API được lưu cục bộ trong trình duyệt của bạn.</p>
      </div>
    </div>
  )
}


