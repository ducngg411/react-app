import { useEffect, useMemo, useState } from 'react'
import Exercises from '../components/Exercises'
import { saveLesson, setCurrentLesson, getCurrentLesson } from '../utils/storage'
import { useToast } from '../components/Toast'


type Lesson = any

const STORAGE = {
  API: 'ai_grammar_api',
  MODEL: 'ai_grammar_model',
  LESSONS: 'ai_grammar_lessons',
}

function buildPrompt(title: string){
  return `Bạn sẽ đóng vai trò là một trợ lý giáo viên tiếng Anh, chuyên tạo ra các bài học chi tiết và hấp dẫn. Nhiệm vụ của bạn là tạo một bài học ngữ pháp dựa trên chủ đề tôi cung cấp, với cấu trúc cụ thể sau và TRẢ VỀ CHỈ JSON hợp lệ theo schema (không giải thích ngoài JSON):

QUAN TRỌNG: Tất cả nội dung giải thích lý thuyết, mục tiêu, và hướng dẫn phải được viết bằng TIẾNG VIỆT để người học Việt Nam dễ hiểu. Chỉ có các ví dụ câu tiếng Anh và thuật ngữ ngữ pháp cần thiết mới dùng tiếng Anh.

{
  "title": string,
  "level": "A1/Beginner"|"A2/Elementary"|"B1/Pre-Intermediate"|"B2/Intermediate"|"C1/Upper-Intermediate"|"C2/Advanced",
  "objectives": string[],
  "prerequisites": string[],
  "grammar": [
    {"title": string, "summary": string, "points": string[], "patterns": string[], "notes": string[], "time_markers": string[], "usage_contexts": string[], "common_mistakes": string[]}
  ],
  "examples": [
    {"title": string, "items": [{"en": string, "vi": string, "explain": string}]}
  ],
  "exercises": {
    "recognition": [{"id": string, "prompt": string, "choices": string[], "answer": number, "explain": string}],
    "gap_fill": [{"id": string, "sentence": string, "blank": string, "options": string[], "answer": string, "explain": string}],
    "transformation": [{"id": string, "source": string, "instruction": string, "answer": string, "explain": string}],
    "error_correction": [{"id": string, "sentence": string, "error_hint": string, "answer": string, "explain": string}],
    "free_production": [{"id": string, "task": string, "sample": string}]
  },
  "createdAt": number
}

Yêu cầu nội dung theo định dạng bạn đưa ra (tôi CHỈ cung cấp tên bài học, bạn tự xác định level phù hợp):
Tên bài học: ${title}
Level: tự xác định dựa trên chủ đề (A1→C2)
Học được gì từ bài này: viết rõ mục tiêu trong "objectives" bằng TIẾNG VIỆT.

1. Kiến thức ngữ pháp: giải thích CỰC KỲ CHI TIẾT các quy tắc BẰNG TIẾNG VIỆT, bao gồm:
   - Cấu trúc đầy đủ (khẳng định/phủ định/nghi vấn) - giải thích bằng tiếng Việt
   - Dấu hiệu nhận biết (time markers, adverbs, expressions) - liệt kê và giải thích bằng tiếng Việt
   - Cách sử dụng trong các ngữ cảnh khác nhau (hội thoại, văn viết, formal/informal) - mô tả bằng tiếng Việt
   - Quy tắc đặc biệt và ngoại lệ - giải thích bằng tiếng Việt
   - Lỗi thường gặp và cách tránh - mô tả lỗi và cách sửa bằng tiếng Việt
   - So sánh với các cấu trúc tương tự - giải thích sự khác biệt bằng tiếng Việt
   - Mẹo ghi nhớ và thực hành - đưa ra lời khuyên bằng tiếng Việt

2. Ví dụ cụ thể: minh họa rõ cho từng phần kiến thức, có giải thích ngắn tiếng Việt.

3. Bài tập thực hành theo 5 mức độ tăng dần:
  - Level 1: Recognition (Chọn đáp án đúng) 5 câu, mỗi câu 3-4 lựa chọn.
  - Level 2: Gap-fill (Điền từ có gợi ý) 5 câu, có gợi ý từ.
  - Level 3: Transformation (Chuyển đổi câu) 5 câu theo yêu cầu.
  - Level 4: Error Correction (Sửa lỗi) 5 câu có lỗi cần sửa.
  - Level 5: Free Production (Tạo câu mới) 2-3 yêu cầu mở, kèm mẫu tham khảo.

LƯU Ý: Tất cả hướng dẫn, giải thích, và mô tả phải bằng TIẾNG VIỆT. Chỉ có câu ví dụ và từ vựng mới dùng tiếng Anh.

Ghi chú số lượng:
- Grammar: 3-5 mục; mỗi mục 6-10 points, 3-5 patterns, 3-5 notes, 4-6 time_markers, 3-5 usage_contexts, 3-5 common_mistakes.
- Ví dụ: 15-25 câu tổng; chia nhóm, có explain.
CHỈ trả về JSON hợp lệ theo schema trên.`
}

async function callAI(prompt: string){
  const apiKey = localStorage.getItem(STORAGE.API)
  const model = localStorage.getItem(STORAGE.MODEL) || 'gpt-4o-mini'
  if(!apiKey) throw new Error('Thiếu API key. Mở Cài đặt để thêm.')
  const resp = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages:[
        { role:'system', content:'You are an expert English grammar teacher who returns COMPLETE JSON ONLY, strictly matching the requested schema. Populate ALL fields with adequate detail (arrays with required number of items).' },
        { role:'user', content: prompt }
      ],
      temperature:0.4,
      max_tokens: 4000
    })
  })
  if(!resp.ok){
    const t = await resp.text().catch(()=> '')
    throw new Error(`OpenAI lỗi: ${resp.status} ${t}`)
  }
  const data = await resp.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAIOpts(prompt: string, opts?: { temperature?: number, max_tokens?: number }){
  const apiKey = localStorage.getItem(STORAGE.API)
  const model = localStorage.getItem(STORAGE.MODEL) || 'gpt-4o-mini'
  if(!apiKey) throw new Error('Thiếu API key. Mở Cài đặt để thêm.')
  const resp = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages:[
        { role:'system', content:'You are an expert English grammar teacher who returns COMPLETE JSON ONLY, strictly matching the requested schema. Populate ALL fields with adequate detail (arrays with required number of items).' },
        { role:'user', content: prompt }
      ],
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.max_tokens ?? 4000
    })
  })
  if(!resp.ok){
    const t = await resp.text().catch(()=> '')
    throw new Error(`OpenAI lỗi: ${resp.status} ${t}`)
  }
  const data = await resp.json()
  return data.choices?.[0]?.message?.content || ''
}

function safeParseJSON(text: string){
  // Strip code fences and extract JSON content
  let cleaned = text
    .replace(/^[\uFEFF\s]+/, '') // Remove BOM/leading whitespace
    .replace(/```json|```/gi, '')
    .replace(/^[\s\S]*?(\{)/, '$1') // Get content from first {
    .replace(/(\})[^\}]*$/, '$1')   // Get content to last }
  
  // Remove trailing commas before closing brackets/braces
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')
  
  // Fix missing commas between various JSON elements
  cleaned = cleaned
    // Between objects: }{ -> },{
    .replace(/}\s*{/g, '},{')
    // Between arrays: ][ -> ],[
    .replace(/]\s*\[/g, '],[')
    // Between array and object: ]{ -> ],{
    .replace(/]\s*{/g, '],{')
    // Between object and array: }[ -> },[
    .replace(/}\s*\[/g, '},[')
    // Between strings: " " -> ","
    .replace(/"\s*"/g, '","')
    // Between string and object: " { -> ",{
    .replace(/"\s*{/g, '",{')
    // Between object and string: } " -> },"
    .replace(/}\s*"/g, '},"')
    // Between string and array: " [ -> ",[
    .replace(/"\s*\[/g, '",[')
    // Between array and string: ] " -> ],"
    .replace(/]\s*"/g, '],"')
    // Between number and object: 123 { -> 123,{
    .replace(/(\d)\s*{/g, '$1,{')
    // Between object and number: } 123 -> },123
    .replace(/}\s*(\d)/g, '},$1')
    // Between number and string: 123 " -> 123,"
    .replace(/(\d)\s*"/g, '$1,"')
    // Between string and number: " 123 -> ",123
    .replace(/"\s*(\d)/g, '",$1')
    // Between boolean and object: true { -> true,{
    .replace(/(true|false)\s*{/g, '$1,{')
    // Between object and boolean: } true -> },true
    .replace(/}\s*(true|false)/g, '},$1')
    // Between boolean and string: true " -> true,"
    .replace(/(true|false)\s*"/g, '$1,"')
    // Between string and boolean: " true -> ",true
    .replace(/"\s*(true|false)/g, '",$1')
    // Between null and object: null { -> null,{
    .replace(/null\s*{/g, 'null,{')
    // Between object and null: } null -> },null
    .replace(/}\s*null/g, '},null')
    // Between null and string: null " -> null,"
    .replace(/null\s*"/g, 'null,"')
    // Between string and null: " null -> ",null
    .replace(/"\s*null/g, '",null')
  
  // Find JSON boundaries
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  
  if(start === -1 || end === -1){
    console.error('safeParseJSON: cannot find JSON object bounds', { 
      snippet: text.slice(0, 200),
      cleanedSnippet: cleaned.slice(0, 200)
    })
    throw new Error('Invalid JSON structure: Missing { or }')
  }
  
  const jsonString = cleaned.slice(start, end + 1)
  
  try{
    return JSON.parse(jsonString)
  }catch(e:any){
    console.error('safeParseJSON parse error:', e?.message)
    console.error('Problematic JSON snippet:', jsonString.slice(Math.max(0, e.message.match(/position (\d+)/)?.[1] - 50 || 0), Math.min(jsonString.length, (e.message.match(/position (\d+)/)?.[1] || 0) + 50)))
    throw e
  }
}

async function fixInvalidJSON(text: string){
  const prompt = `Hãy CHỈ trả về JSON hợp lệ được trích từ nội dung dưới đây. Không dùng markdown hay giải thích, không có \`\`\`. Đảm bảo JSON hoàn chỉnh và không có lỗi syntax.
Nội dung:
${text}`
  const raw = await callAI(prompt)
  // After AI fix, attempt strict parse
  return safeParseJSON(raw)
}

async function tryCompleteMissing(base:any){
  const prompt = `Bổ sung/hoàn thiện JSON sau đây để ĐẦY ĐỦ theo đúng schema đã mô tả trước đó. Trả về CHỈ JSON hợp lệ.\nJSON hiện tại:\n${JSON.stringify(base)}`
  const raw = await callAI(prompt)
  try{
    return safeParseJSON(raw)
  }catch{
    return fixInvalidJSON(raw)
  }
}

export default function Create(){
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(1)
  const [userSentence, setUserSentence] = useState('')
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<{ok:boolean, feedback:string, corrections?:string} | null>(null)
  const [regenLoading, setRegenLoading] = useState(false)
  const toast = useToast()

  function updateProgress(v:number){
    setProgress(Math.max(0, Math.min(100, v)))
  }

  function isCompleteLesson(obj:any){
    if(!obj) return false
    const hasGrammar = Array.isArray(obj.grammar) && obj.grammar.length > 0
    const hasExamples = Array.isArray(obj.examples) && obj.examples.length > 0
    const ex = obj.exercises || {}
    const hasAnyExercise = ["recognition","gap_fill","transformation","error_correction","free_production"].some(k => Array.isArray(ex[k]) && ex[k].length > 0)
    return !!(obj.title && obj.level && Array.isArray(obj.objectives) && obj.objectives.length && hasGrammar && hasExamples && hasAnyExercise)
  }

  async function tryCompleteMissing(base:any){
    const prompt = `Bổ sung/hoàn thiện JSON sau đây để ĐẦY ĐỦ theo đúng schema đã mô tả trước đó. Trả về CHỈ JSON hợp lệ.\nJSON hiện tại:\n${JSON.stringify(base)}`
    const raw = await callAI(prompt)
    try{
      return safeParseJSON(raw)
    }catch{
      return fixInvalidJSON(raw)
    }
  }

  async function generate(){
    if(!title.trim()) return
    setLoading(true)
    updateProgress(5)
    try{
      const prompt = buildPrompt(title.trim())
      updateProgress(15)
      const raw = await callAI(prompt)
      updateProgress(65)
      let data: any
      try {
        data = safeParseJSON(raw)
      } catch (_e) {
        // try AI-based repair
        data = await fixInvalidJSON(raw)
      }
      updateProgress(80)
      if(!isCompleteLesson(data)){
        // fallback: ask AI to complete missing parts
        const completed = await tryCompleteMissing(data)
        if(isCompleteLesson(completed)){
          data = completed
        }
      }
      const finalData = { ...data, createdAt: Date.now() }
      setLesson(finalData)
      setCurrentLesson(finalData)
      setCurrentSection(1) // Reset to first section
      updateProgress(100)
    }catch(e: any){
      alert(e.message || 'Có lỗi khi gọi AI')
    }finally{ setLoading(false) }
    setTimeout(()=> updateProgress(0), 600)
  }

  async function gradeUserSentence(){
    if(!lesson || !userSentence.trim()) return
    setGrading(true)
    setGradeResult(null)
    try{
      const prompt = `Bạn là giáo viên ngữ pháp. Hãy chấm câu do học viên tự viết dựa trên bài học sau. Trả về CHỈ JSON: {"ok": boolean, "feedback": string, "corrections": string}.
Bài học (tóm tắt grammar): ${JSON.stringify(lesson.grammar||[])}
Câu của học viên: ${userSentence}`
      const raw = await callAI(prompt)
      const res = safeParseJSON(raw)
      setGradeResult({ ok: !!res.ok, feedback: String(res.feedback||''), corrections: res.corrections||'' })
    }catch(e:any){
      toast.show('Chấm câu thất bại')
    }finally{ setGrading(false) }
  }

  async function regenerateExercises(){
    if(!lesson) return
    setRegenLoading(true)
    try{
      const prompt = `Chỉ trả về JSON hợp lệ cho key "exercises" theo schema:
{
  "recognition": [{"id": string, "prompt": string, "choices": string[], "answer": number, "explain": string}],
  "gap_fill": [{"id": string, "sentence": string, "blank": string, "options": string[], "answer": string, "explain": string}],
  "transformation": [{"id": string, "source": string, "instruction": string, "answer": string, "explain": string}],
  "error_correction": [{"id": string, "sentence": string, "error_hint": string, "answer": string, "explain": string}],
  "free_production": [{"id": string, "task": string, "sample": string}]
}
Số lượng bắt buộc: recognition(5), gap_fill(5), transformation(5), error_correction(5), free_production(2-3).
Chủ đề: ${lesson.title}
Grammar (tóm tắt): ${JSON.stringify((lesson.grammar||[]).map((g:any)=>({title:g.title, patterns:g.patterns?.slice(0,3)||[], points:g.points?.slice(0,5)||[]})))}
Chỉ JSON, không markdown, không văn bản thừa.`
      const raw = await callAIOpts(prompt, { max_tokens: 3500 })
      let parsed: any
      try {
        parsed = safeParseJSON(raw)
      } catch (_e) {
        const repaired = await fixInvalidJSON(raw)
        parsed = repaired
      }
      const ex = parsed?.exercises ? parsed.exercises : parsed
      if(!ex || typeof ex !== 'object') throw new Error('Dữ liệu exercises không hợp lệ')
      const normalized = {
        recognition: Array.isArray(ex.recognition) ? ex.recognition : [],
        gap_fill: Array.isArray(ex.gap_fill) ? ex.gap_fill : [],
        transformation: Array.isArray(ex.transformation) ? ex.transformation : [],
        error_correction: Array.isArray(ex.error_correction) ? ex.error_correction : [],
        free_production: Array.isArray(ex.free_production) ? ex.free_production : [],
      }
      const updated = { ...lesson, exercises: normalized }
      setLesson(updated)
      setCurrentLesson(updated)
      toast.show('Đã đổi bộ câu hỏi')
    }catch(e:any){
      const msg = e?.message || 'Không đổi được bộ câu hỏi'
      toast.show(msg)
      alert('Không đổi được bộ câu hỏi')
    }finally{ setRegenLoading(false) }
  }

  useEffect(()=>{
    const cur = getCurrentLesson()
    if(cur){ setLesson(cur) }
  },[])

  const sections = [
    { id: 1, title: '1. Kiến thức ngữ pháp', content: (
      <div className="grid md:grid-cols-2 gap-3">
        {(lesson?.grammar||[]).map((g:any,i:number)=> (
          <div key={i} className="p-3 rounded-xl border border-white/10 bg-slate-900">
            <h4 className="font-semibold">{g.title}</h4>
            <p className="text-slate-400 text-sm">{g.summary}</p>
            {!!g.patterns?.length && (<div className="mt-2 text-sm"><div className="text-slate-400">Patterns:</div><ul className="list-disc ml-5">{g.patterns.map((p:string,j:number)=>(<li key={j}>{p}</li>))}</ul></div>)}
            {!!g.points?.length && (<div className="mt-2 text-sm"><div className="text-slate-400">Points:</div><ul className="list-disc ml-5">{g.points.map((p:string,j:number)=>(<li key={j}>{p}</li>))}</ul></div>)}
            {!!g.notes?.length && (<div className="mt-2 text-sm"><div className="text-slate-400">Notes:</div><ul className="list-disc ml-5">{g.notes.map((p:string,j:number)=>(<li key={j}>{p}</li>))}</ul></div>)}
            {!!g.time_markers?.length && (<div className="mt-2 text-sm"><div className="text-slate-400">Dấu hiệu nhận biết:</div><ul className="list-disc ml-5">{g.time_markers.map((p:string,j:number)=>(<li key={j}>{p}</li>))}</ul></div>)}
            {!!g.usage_contexts?.length && (<div className="mt-2 text-sm"><div className="text-slate-400">Cách sử dụng:</div><ul className="list-disc ml-5">{g.usage_contexts.map((p:string,j:number)=>(<li key={j}>{p}</li>))}</ul></div>)}
            {!!g.common_mistakes?.length && (<div className="mt-2 text-sm"><div className="text-slate-400">Lỗi thường gặp:</div><ul className="list-disc ml-5">{g.common_mistakes.map((p:string,j:number)=>(<li key={j}>{p}</li>))}</ul></div>)}
          </div>
        ))}
      </div>
    )},
    { id: 2, title: '2. Ví dụ cụ thể', content: (
      <div className="space-y-3">
        <div className="p-3 rounded-xl border border-white/10 bg-slate-900">
          <h4 className="font-semibold mb-2">Tự đặt câu & chấm tự động</h4>
          <input value={userSentence} onChange={e=> setUserSentence(e.target.value)} placeholder="Nhập câu tiếng Anh của bạn" className="w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
          <div className="mt-2 flex gap-2">
            <button disabled={!userSentence.trim() || grading} onClick={gradeUserSentence} className="px-3 py-1.5 rounded-lg bg-indigo-600 disabled:opacity-60">{grading? 'Đang chấm…':'Chấm câu'}</button>
            {gradeResult && (<span className={`px-2 py-1 rounded ${gradeResult.ok? 'bg-emerald-600/20 text-emerald-300':'bg-red-600/20 text-red-300'}`}>{gradeResult.ok? 'Đúng' : 'Chưa đúng'}</span>)}
          </div>
          {gradeResult && (
            <div className="mt-2 text-sm text-slate-300">
              <div>{gradeResult.feedback}</div>
              {!!gradeResult.corrections && (<div className="text-slate-400">Gợi ý sửa: {gradeResult.corrections}</div>)}
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(lesson?.examples||[]).map((ex:any,i:number)=> (
            <div key={i} className="p-3 rounded-xl border border-white/10 bg-slate-900">
              <h4 className="font-semibold">{ex.title}</h4>
              <div className="mt-2 space-y-1">
                {(ex.items||[]).map((it:any,j:number)=> (
                  <p key={j}><strong>{it.en}</strong><br/><span className="text-slate-400 text-sm">{it.vi}</span>{it.explain && (<><br/><span className="text-slate-500 text-xs">{it.explain}</span></>)}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )},
    { id: 3, title: '3. Bài tập thực hành', content: <Exercises ex={lesson?.exercises} grammar={lesson?.grammar} onRegenerate={regenerateExercises} regenerating={regenLoading} /> }
  ]

  return (
    <div className="grid md:grid-cols-[320px,1fr] gap-4">
      <aside className="space-y-3">
        <div className="p-3 rounded-xl border border-white/10 bg-slate-900">
          <h3 className="font-semibold mb-2">Tạo bài học</h3>
          <label className="text-xs text-slate-400">Tên bài học</label>
          <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="VD: Basic Sentence Structure" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
          <button onClick={generate} className="mt-3 w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">Tạo bằng AI</button>
        </div>
      </aside>
      <main className="space-y-3">
        {loading && (
          <div className="p-3 rounded-xl border border-white/10 bg-slate-900">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>Đang tạo bài học bằng AI…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{width: `${progress}%`}} />
            </div>
          </div>
        )}
        {!lesson && (<div className="text-slate-400 p-6 text-center border border-dashed border-white/10 rounded-xl">Nhập tên bài học và bấm "Tạo bằng AI".</div>)}
        {!!lesson && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/10 bg-slate-900 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{lesson.title}</h2>
                <p className="text-slate-400 text-sm">Level: {lesson.level}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=> { saveLesson(lesson); toast.show('Đã lưu bài học') }} className="px-3 py-2 rounded-lg border border-white/10">Lưu bài học</button>
                <button onClick={()=> navigator.clipboard.writeText(JSON.stringify(lesson,null,2))} className="px-3 py-2 rounded-lg border border-white/10">Sao chép JSON</button>
              </div>
            </div>
            <section className="space-y-2">
              <h3 className="font-semibold">Mục tiêu</h3>
              <div className="flex flex-wrap gap-2">
                {(lesson.objectives||[]).map((o: string,i:number)=>(<span key={i} className="px-2 py-1 rounded-full text-xs border border-white/10">{o}</span>))}
              </div>
            </section>
            
            {/* Section Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`px-3 py-2 rounded-lg border ${
                      currentSection === section.id 
                        ? 'bg-indigo-600 border-indigo-500' 
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              {currentSection < 3 && (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                  Tiếp tục →
                </button>
              )}
            </div>

            {/* Current Section Content */}
            <section className="space-y-2">
              <h3 className="font-semibold">{sections.find(s => s.id === currentSection)?.title}</h3>
              {sections.find(s => s.id === currentSection)?.content}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}


