import { useMemo, useState } from 'react'

type Recognition = { id:string, prompt:string, choices:string[], answer:number, explain?:string }
type GapFill = { id:string, sentence:string, options:string[], answer:string, explain?:string }
type Transformation = { id:string, source:string, instruction:string, answer:string, explain?:string }
type ErrorCorrection = { id:string, sentence:string, error_hint?:string, answer:string, explain?:string }
type FreeProduction = { id:string, task:string, sample?:string }
type Theory = { id:string, prompt:string, answer:string, explain?:string }

export default function Exercises({ ex, grammar, onRegenerate, regenerating }:{ ex:any, grammar?:any[] | undefined, onRegenerate?: ()=>void, regenerating?: boolean }){
  const data = useMemo(()=> ({
    theory: generateTheoryQuestions(grammar),
    recognition: ex?.recognition || [],
    gap_fill: ex?.gap_fill || [],
    transformation: ex?.transformation || [],
    error_correction: ex?.error_correction || [],
    free_production: ex?.free_production || [],
  }), [ex, grammar])

  const [score, setScore] = useState({ correct: 0, attempted: 0 })
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [graded, setGraded] = useState(false)
  const [results, setResults] = useState<Record<string, { ok: boolean, expected: string, explain?: string }>>({})
  const [activeLevel, setActiveLevel] = useState('theory')
  function updateLocal(id:string, val:any){ setAnswers(a=> ({...a,[id]: val})) }
  function reset(){ setScore({correct:0,attempted:0}); setAnswers({}); setGraded(false); setResults({}) }
  const pct = score.attempted ? Math.round((score.correct/score.attempted)*100) : 0

  function gradeAll(){
    const checks: Array<{id:string, ok:boolean, expected:string, explain?:string}> = []
    // theory questions
    data.theory?.forEach((q:Theory)=>{
      const userVal = answers[`theory_${q.id}`]
      if(!userVal){ return checks.push({id:`theory_${q.id}`, ok:false, expected:q.answer, explain:q.explain}) }
      const ok = String(userVal).trim().toLowerCase() === q.answer.trim().toLowerCase()
      checks.push({ id:`theory_${q.id}`, ok, expected:q.answer, explain:q.explain })
    })
    // recognition
    data.recognition.forEach((q:Recognition)=>{
      const userVal = answers[`rec_${q.id}`]
      if(userVal === undefined){ return checks.push({id:`rec_${q.id}`, ok:false, expected: String(q.choices[q.answer] ?? q.answer), explain:q.explain}) }
      const ok = parseInt(String(userVal),10) === q.answer
      checks.push({ id:`rec_${q.id}`, ok, expected: String(q.choices[q.answer] ?? q.answer), explain:q.explain })
    })
    // gap_fill
    data.gap_fill.forEach((q:GapFill)=>{
      const userVal = answers[`gap_${q.id}`]
      if(!userVal){ return checks.push({id:`gap_${q.id}`, ok:false, expected:q.answer, explain:q.explain}) }
      const ok = String(userVal) === q.answer
      checks.push({ id:`gap_${q.id}`, ok, expected:q.answer, explain:q.explain })
    })
    // transformation
    data.transformation.forEach((q:Transformation)=>{
      const userVal = (answers[`tf_${q.id}`]||'').trim().toLowerCase()
      if(!userVal){ return checks.push({id:`tf_${q.id}`, ok:false, expected:q.answer, explain:q.explain}) }
      const ok = userVal === q.answer.trim().toLowerCase()
      checks.push({ id:`tf_${q.id}`, ok, expected:q.answer, explain:q.explain })
    })
    // error correction
    data.error_correction.forEach((q:ErrorCorrection)=>{
      const userVal = (answers[`ec_${q.id}`]||'').trim().toLowerCase()
      if(!userVal){ return checks.push({id:`ec_${q.id}`, ok:false, expected:q.answer, explain:q.explain}) }
      const ok = userVal === q.answer.trim().toLowerCase()
      checks.push({ id:`ec_${q.id}`, ok, expected:q.answer, explain:q.explain })
    })
    const attempted = checks.length
    if(attempted === 0){
      alert('Bạn chưa hoàn thành đáp án. Vui lòng điền/chọn trước khi chấm.')
      return
    }
    const correct = checks.filter(c=> c.ok).length
    setScore({ attempted, correct })
    setGraded(true)
    const map: Record<string, { ok:boolean, expected:string, explain?:string }> = {}
    checks.forEach(c=>{ map[c.id] = { ok: c.ok, expected: c.expected, explain: c.explain } })
    setResults(map)
  }

  const levels = [
    { id: 'theory', name: 'Kiểm tra lý thuyết', count: data.theory?.length || 0 },
    { id: 'level1', name: 'Level 1: Recognition', count: data.recognition?.length || 0 },
    { id: 'level2', name: 'Level 2: Gap-fill', count: data.gap_fill?.length || 0 },
    { id: 'level3', name: 'Level 3: Transformation', count: data.transformation?.length || 0 },
    { id: 'level4', name: 'Level 4: Error Correction', count: data.error_correction?.length || 0 },
    { id: 'level5', name: 'Level 5: Free Production', count: data.free_production?.length || 0 },
  ]

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        {/* Scoreboard + actions, full width */}
        <div className="md:col-span-2 p-3 rounded-xl border border-white/10 bg-slate-900">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>{score.correct}/{score.attempted} đúng</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{width:`${pct}%`}} />
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={gradeAll} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500">Chấm</button>
            <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-white/10">Làm lại</button>
            {onRegenerate && (
              <button onClick={onRegenerate} disabled={!!regenerating} className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-60">
                {regenerating ? 'Đang đổi câu hỏi…' : 'Đổi câu hỏi'}
              </button>
            )}
          </div>
        </div>

        {/* Level tabs, full width */}
        <div className="md:col-span-2 flex gap-2 overflow-x-auto pb-2">
          {levels.map(level=> (
            <button
              key={level.id}
              onClick={()=> setActiveLevel(level.id)}
              className={`px-3 py-2 rounded-lg border whitespace-nowrap ${
                activeLevel === level.id 
                  ? 'bg-indigo-600 border-indigo-500' 
                  : 'border-white/10 text-slate-400'
              }`}
            >
              {level.name} ({level.count})
            </button>
          ))}
        </div>

        {/* Items grid */}
        {activeLevel === 'theory' && data.theory?.map((q:Theory)=> (
          <TheoryItem key={q.id} q={q} onChange={updateLocal} graded={graded} result={results[`theory_${q.id}`]} />
        ))}
        {activeLevel === 'level1' && data.recognition.map((q:Recognition)=> (
          <RecognitionItem key={q.id} q={q} onChange={updateLocal} graded={graded} result={results[`rec_${q.id}`]} />
        ))}
        {activeLevel === 'level2' && data.gap_fill.map((q:GapFill)=> (
          <GapFillItem key={q.id} q={q} onChange={updateLocal} graded={graded} result={results[`gap_${q.id}`]} />
        ))}
        {activeLevel === 'level3' && data.transformation.map((q:Transformation)=> (
          <TransformationItem key={q.id} q={q} onChange={updateLocal} graded={graded} result={results[`tf_${q.id}`]} />
        ))}
        {activeLevel === 'level4' && data.error_correction.map((q:ErrorCorrection)=> (
          <ErrorCorrectionItem key={q.id} q={q} onChange={updateLocal} graded={graded} result={results[`ec_${q.id}`]} />
        ))}
        {activeLevel === 'level5' && (
          <div className="md:col-span-2">
            <FreeProductionSection items={data.free_production} />
          </div>
        )}
      </div>
    </div>
  )
}

function generateTheoryQuestions(grammar: any[] | undefined): Theory[] {
  if(!grammar?.length) return []
  const questions: Theory[] = []
  let id = 1
  
  grammar.forEach(g => {
    // Generate questions from title
    if(g.title) {
      questions.push({
        id: `t${id++}`,
        prompt: `${g.title} trong tiếng Anh thường theo cấu trúc ______`,
        answer: g.patterns?.[0] || 'S + V + O',
        explain: g.summary
      })
    }
    
    // Generate questions from points
    g.points?.forEach((point: string, idx: number) => {
      const words = point.split(' ')
      if(words.length > 3) {
        const blank = words[Math.floor(words.length/2)]
        const prompt = point.replace(blank, '______')
        questions.push({
          id: `t${id++}`,
          prompt,
          answer: blank,
          explain: g.summary
        })
      }
    })
  })
  
  return questions.slice(0, 5) // Limit to 5 questions
}

function TheoryItem({ q, onChange, graded, result }:{ q:Theory, onChange:(id:string,val:any)=>void, graded:boolean, result?:{ok:boolean, expected:string, explain?:string} }){
  const id = `theory_${q.id}`
  const ok = graded ? !!result?.ok : undefined
  const cls = ok===undefined ? 'border-white/10' : ok ? 'border-emerald-400/40 bg-emerald-900/10' : 'border-red-400/40 bg-red-900/10'
  return (
    <div className={`border ${cls} rounded-lg p-2`}>
      <p>{q.prompt}</p>
      <input id={id} onChange={(e)=> onChange(id, (e.target as HTMLInputElement).value)} className="mt-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" placeholder="Nhập đáp án" />
      {graded && ok===false && (
        <div className="mt-2 text-sm">
          <div className="text-red-300">Đáp án: {result?.expected}</div>
          {!!result?.explain && <div className="text-slate-400">Giải thích: {result?.explain}</div>}
        </div>
      )}
    </div>
  )
}

function RecognitionItem({ q, onChange, graded, result }:{ q:Recognition, onChange:(id:string,val:any)=>void, graded:boolean, result?:{ok:boolean, expected:string, explain?:string} }){
  const name = `rec_${q.id}`
  const ok = graded ? !!result?.ok : undefined
  const cls = ok===undefined ? 'border-white/10' : ok ? 'border-emerald-400/40 bg-emerald-900/10' : 'border-red-400/40 bg-red-900/10'
  return (
    <div className={`border ${cls} rounded-lg p-2`}>
      <p>{q.prompt}</p>
      <div className="mt-2 space-y-1">
        {q.choices.map((c,idx)=> (
          <label key={idx} className="block">
            <input onChange={(e)=> onChange(name, (e.target as HTMLInputElement).value)} type="radio" name={name} value={idx} className="mr-2" /> {c}
          </label>
        ))}
      </div>
      {graded && ok===false && (
        <div className="mt-2 text-sm">
          <div className="text-red-300">Sai. Đáp án đúng: {result?.expected}</div>
          {!!result?.explain && <div className="text-slate-400">Giải thích: {result?.explain}</div>}
        </div>
      )}
    </div>
  )
}

function GapFillItem({ q, onChange, graded, result }:{ q:GapFill, onChange:(id:string,val:any)=>void, graded:boolean, result?:{ok:boolean, expected:string, explain?:string} }){
  const id = `gap_${q.id}`
  const ok = graded ? !!result?.ok : undefined
  const cls = ok===undefined ? 'border-white/10' : ok ? 'border-emerald-400/40 bg-emerald-900/10' : 'border-red-400/40 bg-red-900/10'
  return (
    <div className={`border ${cls} rounded-lg p-2`}>
      <p dangerouslySetInnerHTML={{__html: q.sentence.replace('___','<strong>___</strong>')}} />
      <select id={id} onChange={(e)=> onChange(id, (e.target as HTMLSelectElement).value)} className="mt-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none">
        <option value="">-- Chọn --</option>
        {q.options.map((o,i)=>(<option key={i} value={o}>{o}</option>))}
      </select>
      {graded && ok===false && (
        <div className="mt-2 text-sm">
          <div className="text-red-300">Sai. Đáp án: {result?.expected}</div>
          {!!result?.explain && <div className="text-slate-400">Giải thích: {result?.explain}</div>}
        </div>
      )}
    </div>
  )
}

function TransformationItem({ q, onChange, graded, result }:{ q:Transformation, onChange:(id:string,val:any)=>void, graded:boolean, result?:{ok:boolean, expected:string, explain?:string} }){
  const id = `tf_${q.id}`
  const ok = graded ? !!result?.ok : undefined
  const cls = ok===undefined ? 'border-white/10' : ok ? 'border-emerald-400/40 bg-emerald-900/10' : 'border-red-400/40 bg-red-900/10'
  return (
    <div className={`border ${cls} rounded-lg p-2`}>
      <p>{q.instruction}</p>
      <p className="text-slate-400 text-sm">{q.source}</p>
      <input id={id} onChange={(e)=> onChange(id, (e.target as HTMLInputElement).value)} className="mt-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" placeholder="Nhập câu trả lời" />
      {graded && ok===false && (
        <div className="mt-2 text-sm">
          <div className="text-red-300">Đáp án mẫu: {result?.expected}</div>
          {!!result?.explain && <div className="text-slate-400">Giải thích: {result?.explain}</div>}
        </div>
      )}
    </div>
  )
}

function ErrorCorrectionItem({ q, onChange, graded, result }:{ q:ErrorCorrection, onChange:(id:string,val:any)=>void, graded:boolean, result?:{ok:boolean, expected:string, explain?:string} }){
  const id = `ec_${q.id}`
  const ok = graded ? !!result?.ok : undefined
  const cls = ok===undefined ? 'border-white/10' : ok ? 'border-emerald-400/40 bg-emerald-900/10' : 'border-red-400/40 bg-red-900/10'
  return (
    <div className={`border ${cls} rounded-lg p-2`}>
      <p>{q.sentence}</p>
      {!!q.error_hint && <p className="text-slate-400 text-sm">Gợi ý: {q.error_hint}</p>}
      <input id={id} onChange={(e)=> onChange(id, (e.target as HTMLInputElement).value)} className="mt-2 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" placeholder="Câu đã sửa" />
      {graded && ok===false && (
        <div className="mt-2 text-sm">
          <div className="text-red-300">Đáp án mẫu: {result?.expected}</div>
          {!!result?.explain && <div className="text-slate-400">Giải thích: {result?.explain}</div>}
        </div>
      )}
    </div>
  )
}

function FreeProductionSection({ items }:{ items:FreeProduction[] }){
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-lg p-2">
      <h4 className="font-semibold">Nhiệm vụ tự do</h4>
      <div className="space-y-1 mt-1">
        {items.map((it,i)=> (<p key={i}>• {it.task}</p>))}
      </div>
      <button onClick={()=> setOpen(v=>!v)} className="mt-2 px-3 py-1.5 rounded-lg border border-white/10">{open? 'Ẩn mẫu':'Hiển thị mẫu'}</button>
      {open && (
        <div className="text-slate-400 text-sm mt-2 space-y-1">
          {items.map((it,i)=> (<p key={i}>{it.sample||''}</p>))}
        </div>
      )}
    </div>
  )
}


