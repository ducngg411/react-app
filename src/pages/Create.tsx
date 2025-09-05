import { useEffect, useState } from 'react'
import Exercises from '../components/Exercises'
import { saveLesson, setCurrentLesson, getCurrentLesson } from '../utils/storage'
import { useToast } from '../components/Toast'


type Lesson = any

const STORAGE = {
  API: 'ai_grammar_api',
  MODEL: 'ai_grammar_model',
  LESSONS: 'ai_grammar_lessons',
  GEMINI_API: 'ai_grammar_gemini_api',
}

async function findYouTubeVideo(lessonTitle: string){
  try {
    // Encode the lesson title for URL
    const encodedTitle = encodeURIComponent(lessonTitle)
    const apiUrl = `https://extractlinkfromai.onrender.com/search/${encodedTitle}`
    
    console.log('Searching YouTube for:', lessonTitle)
    console.log('API URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if(!response.ok){
      throw new Error(`YouTube search error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('YouTube API response:', data)
    
    if(data.success && data.videos && data.videos.length > 0){
      // Return the first video (most relevant)
      const video = data.videos[0]
      return {
        videoId: video.video_id,
        title: video.name,
        channel: video.channel,
        url: video.url,
        viewCount: video.view_count_formatted
      }
    }
    
    return null
  } catch (error) {
    console.error('YouTube search error:', error)
    return null
  }
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
   - Định nghĩa và ý nghĩa của cấu trúc ngữ pháp
   - Cấu trúc đầy đủ (khẳng định/phủ định/nghi vấn) - giải thích bằng tiếng Việt
   - Các cách sử dụng khác nhau của cấu trúc này (ít nhất 3-5 cách sử dụng)
   - Dấu hiệu nhận biết (time markers, adverbs, expressions) - liệt kê và giải thích bằng tiếng Việt
   - Cách sử dụng trong các ngữ cảnh khác nhau (hội thoại, văn viết, formal/informal) - mô tả bằng tiếng Việt
   - Quy tắc đặc biệt và ngoại lệ - giải thích bằng tiếng Việt
   - Lỗi thường gặp và cách tránh - mô tả lỗi và cách sửa bằng tiếng Việt
   - So sánh với các cấu trúc tương tự - giải thích sự khác biệt bằng tiếng Việt
   - Mẹo ghi nhớ và thực hành - đưa ra lời khuyên bằng tiếng Việt
   - Các trường hợp đặc biệt và nâng cao
   
   YÊU CẦU: Mỗi phần phải có ít nhất 5-10 điểm chi tiết, không được sơ sài. Phải bao gồm tất cả kiến thức có thể tìm thấy về chủ đề này.

2. Ví dụ cụ thể: chia thành 2 nhóm:
   - Nhóm 1: "Ví dụ cơ bản" - 3-5 ví dụ bám sát vào cấu trúc bài học, minh họa rõ từng quy tắc ngữ pháp đã học
   - Nhóm 2: "Ví dụ IELTS Reading" - 2-3 ví dụ trích từ các bài đọc IELTS thực tế, có độ phức tạp cao hơn và ngữ cảnh học thuật
   Mỗi ví dụ có giải thích ngắn tiếng Việt về cách áp dụng kiến thức đã học.

3. Bài tập thực hành theo 5 mức độ tăng dần:
  - Level 1: Recognition (Chọn đáp án đúng) 5 câu, mỗi câu 3-4 lựa chọn.
  - Level 2: Gap-fill (Điền từ có gợi ý) 5 câu, có gợi ý từ.
  - Level 3: Transformation (Chuyển đổi câu) 5 câu theo yêu cầu.
  - Level 4: Error Correction (Sửa lỗi) 5 câu có lỗi cần sửa.
  - Level 5: Free Production (Tạo câu mới) 2-3 yêu cầu mở, kèm mẫu tham khảo.

LƯU Ý: Tất cả hướng dẫn, giải thích, và mô tả phải bằng TIẾNG VIỆT. Chỉ có câu ví dụ và từ vựng mới dùng tiếng Anh.

Ghi chú số lượng:
- Grammar: 3-5 mục; mỗi mục phải có:
  + points: 8-15 điểm chi tiết
  + patterns: 5-8 cấu trúc
  + notes: 5-10 ghi chú quan trọng
  + time_markers: 6-10 dấu hiệu nhận biết
  + usage_contexts: 5-8 ngữ cảnh sử dụng
  + common_mistakes: 5-10 lỗi thường gặp
- Ví dụ: chia thành 2 nhóm với tổng 8-12 câu:
  + "Ví dụ cơ bản": 5-8 câu minh họa trực tiếp kiến thức đã học
  + "Ví dụ IELTS Reading": 3-4 câu từ bài đọc IELTS thực tế
CHỈ trả về JSON hợp lệ theo schema trên.`
}

async function callAI(prompt: string){
  const apiKey = localStorage.getItem(STORAGE.API)
  let model = localStorage.getItem(STORAGE.MODEL) || 'gpt-5'
  if(!apiKey) throw new Error('Thiếu API key. Mở Cài đặt để thêm.')
  
  // Available models with fallback order
  const availableModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  
  // If user selected gpt-5, try it first, then fallback
  const modelsToTry = model === 'gpt-5' ? ['gpt-5', ...availableModels] : [model, ...availableModels.filter(m => m !== model)]
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]
    
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
        body: JSON.stringify({
          model: currentModel,
          messages:[
            { role:'system', content:'You are an expert English grammar teacher who returns COMPLETE JSON ONLY, strictly matching the requested schema. Populate ALL fields with adequate detail (arrays with required number of items).' },
            { role:'user', content: prompt }
          ],
          temperature:0.4,
          max_tokens: 8000
        })
      })
      
      if(resp.ok){
        const data = await resp.json()
        return data.choices?.[0]?.message?.content || ''
      } else {
        const t = await resp.text().catch(()=> '')
        let errorData = null
        try {
          errorData = t ? JSON.parse(t) : null
        } catch {}
        
        // Handle rate limit errors
        if(resp.status === 429 && errorData?.message?.includes('Rate limit reached')){
          console.log(`Rate limit reached for ${currentModel}, trying next model...`)
          if (i === modelsToTry.length - 1) {
            throw new Error(`Rate limit đã đạt giới hạn cho tất cả model. Vui lòng thêm phương thức thanh toán tại https://platform.openai.com/account/billing hoặc thử lại sau.`)
          }
          continue // Try next model
        }
        
        // Handle model not found errors (like gpt-5 not available)
        if(resp.status === 404 || (errorData?.message?.includes('model') && errorData?.message?.includes('not found'))){
          console.log(`Model ${currentModel} not found, trying next model...`)
          if (i === modelsToTry.length - 1) {
            throw new Error(`Không tìm thấy model nào khả dụng. Vui lòng kiểm tra lại cài đặt.`)
          }
          continue
        }
        
        // For other errors, try next model if not the last one
        if (i === modelsToTry.length - 1) {
          throw new Error(`OpenAI lỗi: ${resp.status} ${t}`)
        } else {
          console.log(`Error with ${currentModel}, trying next model...`)
          continue
        }
      }
    } catch (error) {
      console.log(`Exception with ${currentModel}:`, error)
      if (i === modelsToTry.length - 1) {
        throw error
      }
      // Continue to next fallback model
    }
  }
  
  throw new Error('Không thể kết nối với bất kỳ model nào')
}

async function callAIOpts(prompt: string, opts?: { temperature?: number, max_tokens?: number }){
  const apiKey = localStorage.getItem(STORAGE.API)
  let model = localStorage.getItem(STORAGE.MODEL) || 'gpt-5'
  if(!apiKey) throw new Error('Thiếu API key. Mở Cài đặt để thêm.')
  
  // Available models with fallback order
  const availableModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  
  // If user selected gpt-5, try it first, then fallback
  const modelsToTry = model === 'gpt-5' ? ['gpt-5', ...availableModels] : [model, ...availableModels.filter(m => m !== model)]
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]
    
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
        body: JSON.stringify({
          model: currentModel,
          messages:[
            { role:'system', content:'You are an expert English grammar teacher who returns COMPLETE JSON ONLY, strictly matching the requested schema. Populate ALL fields with adequate detail (arrays with required number of items).' },
            { role:'user', content: prompt }
          ],
          temperature: opts?.temperature ?? 0.3,
          max_tokens: opts?.max_tokens ?? 8000
        })
      })
      
      if(resp.ok){
        const data = await resp.json()
        return data.choices?.[0]?.message?.content || ''
      } else {
        const t = await resp.text().catch(()=> '')
        let errorData = null
        try {
          errorData = t ? JSON.parse(t) : null
        } catch {}
        
        // Handle rate limit errors
        if(resp.status === 429 && errorData?.message?.includes('Rate limit reached')){
          console.log(`Rate limit reached for ${currentModel}, trying next model...`)
          if (i === modelsToTry.length - 1) {
            throw new Error(`Rate limit đã đạt giới hạn cho tất cả model. Vui lòng thêm phương thức thanh toán tại https://platform.openai.com/account/billing hoặc thử lại sau.`)
          }
          continue // Try next model
        }
        
        // Handle model not found errors (like gpt-5 not available)
        if(resp.status === 404 || (errorData?.message?.includes('model') && errorData?.message?.includes('not found'))){
          console.log(`Model ${currentModel} not found, trying next model...`)
          if (i === modelsToTry.length - 1) {
            throw new Error(`Không tìm thấy model nào khả dụng. Vui lòng kiểm tra lại cài đặt.`)
          }
          continue
        }
        
        // For other errors, try next model if not the last one
        if (i === modelsToTry.length - 1) {
          throw new Error(`OpenAI lỗi: ${resp.status} ${t}`)
        } else {
          console.log(`Error with ${currentModel}, trying next model...`)
          continue
        }
      }
    } catch (error) {
      console.log(`Exception with ${currentModel}:`, error)
      if (i === modelsToTry.length - 1) {
        throw error
      }
      // Continue to next fallback model
    }
  }
  
  // If all OpenAI models fail, try Gemini as last resort
  console.log('All OpenAI models failed, trying Gemini...')
  try {
    return await callGemini(prompt)
  } catch (geminiError: any) {
    throw new Error(`Tất cả AI services đều không khả dụng. OpenAI: Rate limit hoặc lỗi model. Gemini: ${geminiError.message}`)
  }
}

// Global flag to track if Gemini was used
let geminiUsed = false

async function callSelectedAI(prompt: string, service: 'chatgpt' | 'gemini'){
  if(service === 'gemini'){
    geminiUsed = true
    return await callGemini(prompt)
  } else {
    geminiUsed = false
    return await callAI(prompt)
  }
}

async function callGemini(prompt: string){
  const apiKey = localStorage.getItem(STORAGE.GEMINI_API)
  if(!apiKey) throw new Error('Thiếu Gemini API key. Mở Cài đặt để thêm.')
  
  geminiUsed = true // Mark that Gemini is being used
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là một giáo viên tiếng Anh chuyên nghiệp. 

QUAN TRỌNG: 
- Trả về CHỈ JSON hợp lệ
- Không có markdown, không có giải thích thêm
- Không escape quotes trong JSON strings (dùng " thay vì \")
- Đảm bảo JSON hoàn chỉnh và đúng syntax
- Tất cả strings phải được wrap trong double quotes

${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent JSON
            maxOutputTokens: 8000,
            thinkingConfig: {
              thinkingBudget: 0 // Disable thinking for faster response
            }
          }
        })
    })
    
    if(!resp.ok){
      const t = await resp.text().catch(()=> '')
      throw new Error(`Gemini lỗi: ${resp.status} ${t}`)
    }
    
    const data = await resp.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Debug: Log first 500 chars of response for troubleshooting
    console.log('Gemini response preview:', responseText.slice(0, 500))
    
    return responseText
  } catch (error: any) {
    throw new Error(`Gemini không khả dụng: ${error.message}`)
  }
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
  
  // Additional fixes for common Gemini JSON issues
  cleaned = cleaned
    // Fix escaped quotes in strings (Gemini often over-escapes)
    .replace(/\\"/g, '"') // Replace \" with "
    .replace(/\\\\/g, '\\') // Replace \\ with \
    // Fix missing commas after array elements
    .replace(/\]\s*\[/g, '],[')
    .replace(/\]\s*"/g, '],"')
    .replace(/\]\s*{/g, '],{')
    .replace(/\]\s*\d/g, '],$1')
    // Fix missing commas before array elements
    .replace(/\[\s*"/g, '["')
    .replace(/\[\s*{/g, '[{')
    .replace(/\[\s*\d/g, '[$1')
    // Fix malformed property names
    .replace(/"([^"]*)\\\":/g, '"$1":') // Fix \"title\": -> "title":
    .replace(/"([^"]*)\\\"/g, '"$1"') // Fix \"value\" -> "value"
  
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
    
    // Try to fix common JSON issues
    try {
      const fixed = jsonString
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
        .replace(/\[\s*\]/g, '[]') // Fix empty arrays
        .replace(/\{\s*\}/g, '{}') // Fix empty objects
        .replace(/"\s*:\s*"/g, '":"') // Fix spacing around colons
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/\\"/g, '"') // Fix over-escaped quotes
        .replace(/\\\\/g, '\\') // Fix double backslashes
        .replace(/"([^"]*)\\\":/g, '"$1":') // Fix malformed property names
        .replace(/"([^"]*)\\\"/g, '"$1"') // Fix malformed string values
        .replace(/:\s*"([^"]*)\\\"/g, ': "$1"') // Fix values with escaped quotes
      
      console.log('Attempting to fix JSON with additional corrections...')
      return JSON.parse(fixed)
    } catch (fixError: any) {
      console.error('JSON fix failed:', fixError.message)
      throw e // Throw original error if fix doesn't work
    }
  }
}

async function fixInvalidJSON(text: string, service: 'chatgpt' | 'gemini' = 'chatgpt'){
  const prompt = `Hãy CHỈ trả về JSON hợp lệ được trích từ nội dung dưới đây. Không dùng markdown hay giải thích, không có \`\`\`. Đảm bảo JSON hoàn chỉnh và không có lỗi syntax.
Nội dung:
${text}`
  const raw = await callSelectedAI(prompt, service)
  // After AI fix, attempt strict parse
  return safeParseJSON(raw)
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
  const [aiService, setAiService] = useState<'chatgpt' | 'gemini'>('chatgpt')
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


  async function generate(){
    if(!title.trim()) return
    setLoading(true)
    updateProgress(5)
    try{
      // Xóa lesson cũ để tránh cache
      setLesson(null)
      
      const prompt = buildPrompt(title.trim())
      updateProgress(15)
      
      // Tìm kiếm video YouTube song song với AI generation
      const videoPromise = findYouTubeVideo(title.trim())
      
      const raw = await callSelectedAI(prompt, aiService)
      updateProgress(65)
      
      // Lấy kết quả video
      const video = await videoPromise
      let data: any
      try {
        data = safeParseJSON(raw)
      } catch (_e) {
        // try AI-based repair
        data = await fixInvalidJSON(raw, aiService)
      }
      updateProgress(80)
      if(!isCompleteLesson(data)){
        // fallback: ask AI to complete missing parts
        const prompt = `Bổ sung/hoàn thiện JSON sau đây để ĐẦY ĐỦ theo đúng schema đã mô tả trước đó. Trả về CHỈ JSON hợp lệ.\nJSON hiện tại:\n${JSON.stringify(data)}`
        const raw = await callSelectedAI(prompt, aiService)
        try{
          const completed = safeParseJSON(raw)
          if(isCompleteLesson(completed)){
            data = completed
          }
        }catch{
          const completed = await fixInvalidJSON(raw, aiService)
          if(isCompleteLesson(completed)){
            data = completed
          }
        }
      }
      
      // Check if Gemini was used
      const finalData = { ...data, createdAt: Date.now(), createdWithGemini: geminiUsed, video: video }
      geminiUsed = false // Reset flag
      console.log('🎯 Final lesson data:', finalData)
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
      <div className="p-4 rounded-xl border border-white/10 bg-slate-900">
        {/* YouTube Video Section */}
        {lesson?.video && (
          <div className="mb-6 pb-6 border-b border-white/10">
            <h4 className="font-semibold text-lg mb-3">📺 Video học ngữ pháp</h4>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${lesson.video.videoId}`}
                title={lesson.video.title}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-sm text-slate-300 mb-1">{lesson.video.title}</h5>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>📺 {lesson.video.channel}</span>
                  <span>👀 {lesson.video.viewCount} lượt xem</span>
                </div>
              </div>
              <a 
                href={lesson.video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-4 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg flex items-center gap-2"
              >
                🔗 Xem trên YouTube
              </a>
            </div>
          </div>
        )}
        
        {(lesson?.grammar||[]).map((g:any,i:number)=> (
          <div key={i} className={i > 0 ? "mt-6 pt-6 border-t border-white/10" : ""}>
            <h4 className="font-semibold text-lg mb-3">{g.title}</h4>
            <p className="text-slate-400 text-sm mb-4">{g.summary}</p>
            
            {/* Dynamic content rendering - display exactly as AI generated */}
            <div className="space-y-4">
              {g.points?.map((point:string, j:number) => (
                <div key={j} className="text-sm text-slate-300 leading-relaxed">
                  {point}
                </div>
              ))}
            </div>
            
            {!!g.patterns?.length && (
              <div className="mt-4">
                <div className="text-slate-300 font-medium mb-2">Cấu trúc:</div>
                <div className="space-y-2">
                  {g.patterns.map((p:string,j:number)=>(
                    <div key={j} className="text-sm font-mono bg-slate-800/50 px-3 py-2 rounded border border-white/5">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.notes?.length && (
              <div className="mt-4">
                <div className="text-slate-300 font-medium mb-2">Ghi chú quan trọng:</div>
                <div className="space-y-2">
                  {g.notes.map((note:string,j:number)=>(
                    <div key={j} className="text-sm text-slate-300 bg-yellow-600/10 border border-yellow-500/20 px-3 py-2 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.time_markers?.length && (
              <div className="mt-4">
                <div className="text-slate-300 font-medium mb-2">Dấu hiệu nhận biết:</div>
                <div className="flex flex-wrap gap-2">
                  {g.time_markers.map((marker:string,j:number)=>(
                    <span key={j} className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      {marker}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.usage_contexts?.length && (
              <div className="mt-4">
                <div className="text-slate-300 font-medium mb-2">Cách sử dụng:</div>
                <div className="space-y-2">
                  {g.usage_contexts.map((context:string,j:number)=>(
                    <div key={j} className="text-sm text-slate-300 bg-green-600/10 border border-green-500/20 px-3 py-2 rounded">
                      {context}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.common_mistakes?.length && (
              <div className="mt-4">
                <div className="text-slate-300 font-medium mb-2">Lỗi thường gặp:</div>
                <div className="space-y-2">
                  {g.common_mistakes.map((mistake:string,j:number)=>(
                    <div key={j} className="text-sm text-red-300 bg-red-600/10 border border-red-500/20 px-3 py-2 rounded">
                      {mistake}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )},
    { id: 2, title: '2. Ví dụ cụ thể', content: (
      <div className="p-4 rounded-xl border border-white/10 bg-slate-900">
        <div className="mb-6 pb-6 border-b border-white/10">
          <h4 className="font-semibold mb-3">Tự đặt câu & chấm tự động</h4>
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
        {(lesson?.examples||[]).map((ex:any,i:number)=> (
          <div key={i} className={i > 0 ? "mt-6 pt-6 border-t border-white/10" : ""}>
            <h4 className="font-semibold text-lg mb-3">{ex.title}</h4>
            <div className="space-y-3">
              {(ex.items||[]).map((it:any,j:number)=> (
                <div key={j} className="p-3 rounded-lg border border-white/5 bg-slate-950">
                  <p className="font-medium text-indigo-300">{it.en}</p>
                  <p className="text-slate-400 text-sm mt-1">{it.vi}</p>
                  {it.explain && <p className="text-slate-500 text-xs mt-2 italic">{it.explain}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )},
    { id: 3, title: '3. Bài tập thực hành', content: <Exercises ex={lesson?.exercises} grammar={lesson?.grammar} onRegenerate={regenerateExercises} regenerating={regenLoading} /> }
  ]

  return (
    <div className="space-y-4">
      {/* Header với form tạo bài học */}
      <div className="p-4 rounded-xl border border-white/10 bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-3">Tạo bài học mới</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-md">
                <label className="text-xs text-slate-400">Tên bài học</label>
                <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="VD: Future Perfect, Present Perfect Continuous..." className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none" />
              </div>
              <div className="min-w-[140px]">
                <label className="text-xs text-slate-400">AI Service</label>
                <select value={aiService} onChange={e=> setAiService(e.target.value as 'chatgpt' | 'gemini')} className="mt-1 w-full px-3 py-2 rounded-lg border border-white/10 bg-slate-950 outline-none">
                  <option value="chatgpt">🤖 ChatGPT</option>
                  <option value="gemini">✨ Gemini</option>
                </select>
              </div>
              <button onClick={generate} disabled={loading} className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 whitespace-nowrap">
                {loading ? 'Đang tạo...' : 'Tạo bằng AI'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="space-y-4">
        {loading && (
          <div className="p-6 rounded-xl border border-white/10 bg-slate-900">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
              <span className="font-medium">Đang tạo bài học bằng {aiService === 'gemini' ? '✨ Gemini' : '🤖 ChatGPT'}…</span>
              <span className="bg-indigo-600/20 px-2 py-1 rounded">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div className={`h-full transition-all duration-300 ${aiService === 'gemini' ? 'bg-gradient-to-r from-purple-500 to-pink-400' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`} style={{width: `${progress}%`}} />
            </div>
          </div>
        )}
        {!lesson && (<div className="text-slate-400 p-6 text-center border border-dashed border-white/10 rounded-xl">Nhập tên bài học và bấm "Tạo bằng AI".</div>)}
        {!!lesson && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-white/10 bg-slate-900 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{lesson.title}</h2>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span>Level: {lesson.level}</span>
                  {lesson?.createdWithGemini ? (
                    <span className="px-2 py-1 rounded-full bg-purple-600/20 text-purple-300 text-xs">
                      ✨ Powered by Gemini
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 text-xs">
                      🤖 Powered by ChatGPT ({localStorage.getItem(STORAGE.MODEL) || 'gpt-5'})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=> { saveLesson(lesson); toast.show('Đã lưu bài học') }} className="px-3 py-2 rounded-lg border border-white/10">Lưu bài học</button>
                <button onClick={()=> navigator.clipboard.writeText(JSON.stringify(lesson,null,2))} className="px-3 py-2 rounded-lg border border-white/10">Sao chép JSON</button>
                <button onClick={()=> { localStorage.removeItem(STORAGE.LESSONS); setLesson(null); toast.show('Đã xóa cache') }} className="px-3 py-2 rounded-lg border border-red-500/20 text-red-400">Xóa cache</button>
              </div>
            </div>
            <section className="space-y-2">
              <h3 className="font-semibold">Mục tiêu</h3>
              <div className="flex flex-wrap gap-2">
                {(lesson.objectives||[]).map((o: string,i:number)=>(<span key={i} className="px-2 py-1 rounded-full text-xs border border-white/10">{o}</span>))}
              </div>
            </section>
            
            {/* Section Navigation */}
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/10">
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
            <section className="space-y-4">
              <h3 className="font-semibold text-lg">{sections.find(s => s.id === currentSection)?.title}</h3>
              <div className="min-h-[600px]">
                {sections.find(s => s.id === currentSection)?.content}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}


