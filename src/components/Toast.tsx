import React, { createContext, useContext, useMemo, useState } from 'react'

type ToastContextType = { show: (msg:string)=>void }
const ToastContext = createContext<ToastContextType>({ show: ()=>{} })

export function useToast(){ return useContext(ToastContext) }

export function ToastProvider({ children }:{ children: React.ReactNode }){
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState(false)
  const show = (m:string)=>{
    setMsg(m); setOpen(true); window.clearTimeout((window as any).__to);
    ;(window as any).__to = window.setTimeout(()=> setOpen(false), 2200)
  }
  const value = useMemo(()=> ({ show }),[])
  return (
    <ToastContext.Provider value={value}>
      {children}
      {open && (
        <div className="fixed bottom-4 right-4 px-3 py-2 rounded-lg border border-white/10 bg-slate-900 shadow-lg text-sm">
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}


