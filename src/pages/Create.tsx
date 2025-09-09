import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Exercises from '../components/Exercises'
import { useToast } from '../components/Toast'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

type Lesson = any

async function findYouTubeVideo(lessonTitle: string){
  try {
    // Encode the lesson title for URL
    const encodedTitle = encodeURIComponent(lessonTitle)
    const apiUrl = `https://extractlinkfromai.onrender.com/search/${encodedTitle}`
    
    console.log('Searching YouTube for:', lessonTitle)
    console.log('API URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors' // Explicitly set CORS mode
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
  } catch (error: any) {
    console.error('YouTube search error:', error)
    
    // Check if it's a CORS error
    if(error.message?.includes('CORS') || error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      console.warn('CORS error detected - YouTube search API is not accessible from this origin')
      console.warn('This is normal when running locally. YouTube videos will be skipped.')
    }
    
    return null
  }
}

function buildPrompt(title: string){
  return `Bạn sẽ đóng vai trò là một trợ lý giáo viên tiếng Anh, chuyên tạo ra các bài học chi tiết và hấp dẫn. Nhiệm vụ của bạn là tạo một bài học ngữ pháp dựa trên chủ đề tôi cung cấp, với cấu trúc cụ thể sau và TRẢ VỀ CHỈ JSON hợp lệ theo schema (không giải thích ngoài JSON):

QUAN TRỌNG: 
- Tất cả nội dung giải thích lý thuyết, mục tiêu, và hướng dẫn phải được viết bằng TIẾNG VIỆT để người học Việt Nam dễ hiểu. Chỉ có các ví dụ câu tiếng Anh và thuật ngữ ngữ pháp cần thiết mới dùng tiếng Anh.
- TRÁNH sử dụng dấu ngoặc kép (") trong nội dung text để tránh lỗi JSON
- TRÁNH sử dụng dấu phẩy (,) trong nội dung text để tránh lỗi JSON
- Thay thế các ký tự đặc biệt bằng từ ngữ thông thường
- Đảm bảo JSON hoàn chỉnh và đúng cú pháp

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



// Global flag to track if Gemini was used
// let geminiUsed = false

async function callSelectedAI(prompt: string){
  return await callGemini(prompt)
}

async function callGemini(prompt: string){
  // API key từ environment variables - tất cả user sẽ dùng chung
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
  
  if(!apiKey) throw new Error('Thiếu Gemini API key trong environment variables. Vui lòng kiểm tra file .env')
  
  // Mark that Gemini is being used
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
- TRÁNH sử dụng dấu ngoặc kép (") trong nội dung text
- TRÁNH sử dụng dấu phẩy (,) trong nội dung text
- Thay thế các ký tự đặc biệt bằng từ ngữ thông thường
- Đảm bảo tất cả arrays và objects được đóng đúng cách

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

// Advanced JSON sanitizer to handle problematic characters in content
function sanitizeJSONContent(text: string): string {
  // First, extract and protect JSON structure
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  
  if (jsonStart === -1 || jsonEnd === -1) {
    return text
  }
  
  const beforeJSON = text.slice(0, jsonStart)
  const jsonContent = text.slice(jsonStart, jsonEnd + 1)
  const afterJSON = text.slice(jsonEnd + 1)
  
  // Process JSON content to fix common issues
  let processed = jsonContent
  
  // Step 1: Fix unescaped quotes in string values
  // This regex finds string values and ensures quotes inside are properly escaped
  processed = processed.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, (match, p1, p2, p3) => {
    // If we have quotes in the middle, escape them
    if (p2.includes('"')) {
      const escaped = p2.replace(/"/g, '\\"')
      return `"${p1}${escaped}${p3}":`
    }
    return match
  })
  
  // Step 2: Fix string values that contain quotes
  processed = processed.replace(/:\s*"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
    if (p2.includes('"')) {
      const escaped = p2.replace(/"/g, '\\"')
      return `: "${p1}${escaped}${p3}"`
    }
    return match
  })
  
  // Step 3: Fix commas inside string values that break JSON
  processed = processed.replace(/:\s*"([^"]*),([^"]*)"/g, ': "$1\\,$2"')
  
  // Step 4: Fix brackets inside string values
  processed = processed.replace(/:\s*"([^"]*)\[([^"]*)"/g, ': "$1\\[$2"')
  processed = processed.replace(/:\s*"([^"]*)\]([^"]*)"/g, ': "$1\\]$2"')
  
  // Step 5: Fix braces inside string values
  processed = processed.replace(/:\s*"([^"]*)\{([^"]*)"/g, ': "$1\\{$2"')
  processed = processed.replace(/:\s*"([^"]*)\}([^"]*)"/g, ': "$1\\}$2"')
  
  return beforeJSON + processed + afterJSON
}

function safeParseJSON(text: string){
  console.log('🔧 Starting JSON parsing...')
  
  // Step 1: Clean and sanitize the text
  let cleaned = text
    .replace(/^[\uFEFF\s]+/, '') // Remove BOM/leading whitespace
    .replace(/```json|```/gi, '')
    .replace(/^[\s\S]*?(\{)/, '$1') // Get content from first {
    .replace(/(\})[^\}]*$/, '$1')   // Get content to last }
  
  // Step 2: Sanitize problematic content
  cleaned = sanitizeJSONContent(cleaned)
  
  // Step 3: Fix structural JSON issues
  cleaned = cleaned
    // Remove trailing commas before closing brackets/braces
    .replace(/,\s*([}\]])/g, '$1')
    // Fix missing commas between elements
    .replace(/}\s*{/g, '},{')
    .replace(/]\s*\[/g, '],[')
    .replace(/]\s*{/g, '],{')
    .replace(/}\s*\[/g, '},[')
    .replace(/"\s*"/g, '","')
    .replace(/"\s*{/g, '",{')
    .replace(/}\s*"/g, '},"')
    .replace(/"\s*\[/g, '",[')
    .replace(/]\s*"/g, '],"')
    .replace(/(\d)\s*{/g, '$1,{')
    .replace(/}\s*(\d)/g, '},$1')
    .replace(/(\d)\s*"/g, '$1,"')
    .replace(/"\s*(\d)/g, '",$1')
    .replace(/(true|false)\s*{/g, '$1,{')
    .replace(/}\s*(true|false)/g, '},$1')
    .replace(/(true|false)\s*"/g, '$1,"')
    .replace(/"\s*(true|false)/g, '",$1')
    .replace(/null\s*{/g, 'null,{')
    .replace(/}\s*null/g, '},null')
    .replace(/null\s*"/g, 'null,"')
    .replace(/"\s*null/g, '",null')
  
  // Step 4: Additional Gemini-specific fixes
  cleaned = cleaned
    // Fix over-escaped quotes
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    // Fix malformed property names
    .replace(/"([^"]*)\\\":/g, '"$1":')
    .replace(/"([^"]*)\\\"/g, '"$1"')
    // Remove trailing commas in property names
    .replace(/"([^"]*),":/g, '"$1":')
    .replace(/"([^"]*),",/g, '"$1",')
    .replace(/"([^"]*),"\s*}/g, '"$1"}')
    .replace(/"([^"]*),"\s*]/g, '"$1"]')
    .replace(/"([^"]*),"\s*,/g, '"$1",')
    .replace(/"([^"]*),"\s*:/g, '"$1":')
  
  // Step 5: Find JSON boundaries
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  
  if(start === -1 || end === -1){
    console.error('❌ Cannot find JSON object bounds')
    throw new Error('Invalid JSON structure: Missing { or }')
  }
  
  const jsonString = cleaned.slice(start, end + 1)
  console.log('🔍 JSON string length:', jsonString.length)
  
  // Step 6: Try parsing with multiple strategies
  try {
    const result = JSON.parse(jsonString)
    console.log('✅ JSON parsed successfully')
    return result
  } catch (e: any) {
    console.error('❌ Initial parse failed:', e.message)
    
    // Strategy 1: Fix common structural issues
    try {
      const fixed = jsonString
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
        .replace(/\[\s*\]/g, '[]') // Fix empty arrays
        .replace(/\{\s*\}/g, '{}') // Fix empty objects
        .replace(/"\s*:\s*"/g, '":"') // Fix spacing around colons
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/\\"/g, '"') // Fix over-escaped quotes
        .replace(/\\\\/g, '\\') // Fix double backslashes
        .replace(/"([^"]*),":/g, '"$1":') // Fix property names with commas
        .replace(/"([^"]*),",/g, '"$1",')
        .replace(/"([^"]*),"\s*}/g, '"$1"}')
        .replace(/"([^"]*),"\s*]/g, '"$1"]')
        .replace(/"([^"]*),"\s*,/g, '"$1",')
        .replace(/"([^"]*),"\s*:/g, '"$1":')
      
      console.log('🔧 Trying structural fixes...')
      return JSON.parse(fixed)
    } catch (fixError: any) {
      console.error('❌ Structural fixes failed:', fixError.message)
      
      // Strategy 2: Extract and reconstruct valid parts
      try {
        const reconstructed = reconstructJSONFromFragments(jsonString)
        console.log('🔧 Trying reconstruction...')
        return reconstructed
      } catch (reconstructError: any) {
        console.error('❌ Reconstruction failed:', reconstructError.message)
        throw e // Throw original error
      }
    }
  }
}

// Helper function to reconstruct JSON from fragments
function reconstructJSONFromFragments(jsonString: string): any {
  console.log('🔧 Reconstructing JSON from fragments...')
  
  // Extract basic fields
  const titleMatch = jsonString.match(/"title":\s*"([^"]+)"/)
  const levelMatch = jsonString.match(/"level":\s*"([^"]+)"/)
  
  if (!titleMatch || !levelMatch) {
    throw new Error('Cannot extract basic fields')
  }
  
  // Create minimal valid structure
  const reconstructed: any = {
    title: titleMatch[1],
    level: levelMatch[1],
    objectives: [],
    prerequisites: [],
    grammar: [],
    examples: [],
    exercises: {
      recognition: [],
      gap_fill: [],
      transformation: [],
      error_correction: [],
      free_production: []
    }
  }
  
  // Try to extract objectives
  try {
    const objectivesMatch = jsonString.match(/"objectives":\s*\[(.*?)\]/s)
    if (objectivesMatch) {
      const objectivesStr = objectivesMatch[1]
      // Extract individual quoted strings
      const objectiveMatches = objectivesStr.match(/"([^"]+)"/g)
      if (objectiveMatches) {
        reconstructed.objectives = objectiveMatches.map(m => m.slice(1, -1))
      }
    }
  } catch (e) {
    console.warn('Could not extract objectives')
  }
  
  // Try to extract grammar sections
  try {
    const grammarMatch = jsonString.match(/"grammar":\s*\[(.*?)\]/s)
    if (grammarMatch) {
      const grammarStr = grammarMatch[1]
      // Find individual grammar objects
      const grammarObjects = grammarStr.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
      if (grammarObjects) {
        reconstructed.grammar = grammarObjects.map(objStr => {
          try {
            return JSON.parse(objStr)
          } catch (e) {
            // Create minimal grammar object
            const titleMatch = objStr.match(/"title":\s*"([^"]+)"/)
            return {
              title: titleMatch ? titleMatch[1] : 'Grammar Point',
              summary: 'Grammar explanation',
              points: ['Point 1', 'Point 2'],
              patterns: ['Pattern 1'],
              notes: ['Note 1'],
              time_markers: [],
              usage_contexts: [],
              common_mistakes: []
            }
          }
        })
      }
    }
  } catch (e) {
    console.warn('Could not extract grammar')
  }
  
  // Try to extract examples
  try {
    const examplesMatch = jsonString.match(/"examples":\s*\[(.*?)\]/s)
    if (examplesMatch) {
      const examplesStr = examplesMatch[1]
      const exampleObjects = examplesStr.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
      if (exampleObjects) {
        reconstructed.examples = exampleObjects.map(objStr => {
          try {
            return JSON.parse(objStr)
          } catch (e) {
            const titleMatch = objStr.match(/"title":\s*"([^"]+)"/)
            return {
              title: titleMatch ? titleMatch[1] : 'Example',
              items: [
                { en: 'Example sentence', vi: 'Ví dụ', explain: 'Explanation' }
              ]
            }
          }
        })
      }
    }
  } catch (e) {
    console.warn('Could not extract examples')
  }
  
  console.log('✅ JSON reconstructed successfully')
  return reconstructed
}

async function fixInvalidJSON(text: string){
  const prompt = `Hãy CHỈ trả về JSON hợp lệ được trích từ nội dung dưới đây. Không dùng markdown hay giải thích, không có \`\`\`. Đảm bảo JSON hoàn chỉnh và không có lỗi syntax.
Nội dung:
${text}`
  const raw = await callGemini(prompt)
  // After AI fix, attempt strict parse
  return safeParseJSON(raw)
}


export default function Create(){
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [currentStep, setCurrentStep] = useState('')
  const [currentSection, setCurrentSection] = useState(1)
  const [userSentence, setUserSentence] = useState('')
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<{ok:boolean, feedback:string, corrections?:string} | null>(null)
  const [regenLoading, setRegenLoading] = useState(false)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [isSavedLesson, setIsSavedLesson] = useState(false)
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Authentication guard
  useEffect(() => {
    if (!isAuthenticated) {
      toast.show('Vui lòng đăng nhập để sử dụng tính năng này')
      navigate('/library')
    }
  }, [isAuthenticated, navigate, toast])

  // Load lesson from router state when component mounts (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return

    if (location.state?.lesson) {
      console.log('📖 Loading lesson from router state:', location.state.lesson)
      console.log('📖 Lesson title:', location.state.lesson.title)
      console.log('📖 Lesson level:', location.state.lesson.level)
      console.log('📖 Lesson objectives:', location.state.lesson.objectives)
      setLesson(location.state.lesson)
      setCurrentSection(1)
      setIsSavedLesson(true) // Lesson từ router state là lesson đã lưu
    } else {
      // Check if there's a lesson ID in URL params
      const urlParams = new URLSearchParams(location.search)
      const lessonId = urlParams.get('lessonId')
      
      if (lessonId) {
        console.log('📖 Loading lesson from database:', lessonId)
        loadLessonFromDatabase(lessonId)
      }
    }
  }, [location.state, location.search, isAuthenticated])

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    )
  }

  // Function to load lesson from database
  const loadLessonFromDatabase = async (lessonId: string) => {
    try {
      setLoadingLesson(true)
      const response = await apiService.getLesson(lessonId)
      if (response.success) {
        console.log('📚 Loaded lesson from database:', response.data.lesson)
        setLesson(response.data.lesson)
        setCurrentSection(1)
        setIsSavedLesson(true) // Lesson từ database là lesson đã lưu
        // Clear URL params after successful load
        navigate('/', { replace: true })
      } else {
        console.error('❌ Failed to load lesson:', response.message)
        toast.show('Không thể tải bài học: ' + response.message)
      }
    } catch (error) {
      console.error('❌ Error loading lesson:', error)
      toast.show('Có lỗi khi tải bài học')
    } finally {
      setLoadingLesson(false)
    }
  }

  // Debug logging for lesson state
  useEffect(() => {
    if (lesson) {
      console.log('📚 Current lesson state:', {
        title: lesson.title,
        level: lesson.level,
        hasObjectives: Array.isArray(lesson.objectives) && lesson.objectives.length > 0,
        hasGrammar: Array.isArray(lesson.grammar) && lesson.grammar.length > 0,
        hasExamples: Array.isArray(lesson.examples) && lesson.examples.length > 0,
        hasExercises: !!lesson.exercises
      })
    }
  }, [lesson])

  function updateProgress(v:number, step: string = '', text: string = ''){
    setProgress(Math.max(0, Math.min(100, v)))
    setCurrentStep(step)
    setProgressText(text)
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
    updateProgress(5, 'Khởi tạo', 'Đang chuẩn bị tạo bài học...')
    
    try{
      // Xóa lesson cũ để tránh cache
      setLesson(null)
      setIsSavedLesson(false) // Reset khi tạo lesson mới
      
      const prompt = buildPrompt(title.trim())
      updateProgress(10, 'Tìm kiếm video', 'Đang tìm video liên quan trên YouTube...')
      
      // Tìm kiếm video YouTube song song với AI generation
      const videoPromise = findYouTubeVideo(title.trim()).catch(error => {
        console.warn('YouTube search failed, continuing without video:', error)
        return null
      })
      
      updateProgress(20, 'Gọi AI', 'Đang gọi Gemini để tạo nội dung...')
      const raw = await callSelectedAI(prompt)
      updateProgress(60, 'Xử lý JSON', 'Đang phân tích và xử lý dữ liệu từ AI...')
      
      // Lấy kết quả video
      const video = await videoPromise
      let data: any
      
      // Try multiple parsing strategies
      let parseAttempts = 0
      const maxAttempts = 3
      
      while (parseAttempts < maxAttempts) {
        try {
          if (parseAttempts === 0) {
            data = safeParseJSON(raw)
          } else {
            // Try AI-based repair for subsequent attempts
            updateProgress(65 + parseAttempts * 5, 'Sửa lỗi JSON', `Đang sửa lỗi định dạng JSON (lần ${parseAttempts + 1})...`)
            data = await fixInvalidJSON(raw)
          }
          
          if (isCompleteLesson(data)) {
            console.log(`✅ JSON parsed successfully on attempt ${parseAttempts + 1}`)
            break
          } else {
            console.log(`⚠️ Incomplete lesson on attempt ${parseAttempts + 1}, trying again...`)
            parseAttempts++
          }
        } catch (error: any) {
          console.error(`❌ Parse attempt ${parseAttempts + 1} failed:`, error.message)
          parseAttempts++
          
          if (parseAttempts >= maxAttempts) {
            // Final fallback: create a minimal lesson structure
            console.log('🔧 Creating fallback lesson structure...')
            data = {
              title: title.trim(),
              level: 'B1/Pre-Intermediate',
              objectives: [`Học về ${title.trim()}`],
              prerequisites: [],
              grammar: [{
                title: title.trim(),
                summary: `Giải thích về ${title.trim()}`,
                points: [`Đây là điểm quan trọng về ${title.trim()}`],
                patterns: [`Cấu trúc cơ bản của ${title.trim()}`],
                notes: [`Ghi chú về ${title.trim()}`],
                time_markers: [],
                usage_contexts: [`Cách sử dụng ${title.trim()}`],
                common_mistakes: [`Lỗi thường gặp với ${title.trim()}`]
              }],
              examples: [{
                title: 'Ví dụ cơ bản',
                items: [{
                  en: 'Example sentence',
                  vi: 'Ví dụ câu',
                  explain: 'Giải thích'
                }]
              }],
              exercises: {
                recognition: [],
                gap_fill: [],
                transformation: [],
                error_correction: [],
                free_production: []
              }
            }
            break
          }
        }
      }
      
      updateProgress(70, 'Kiểm tra dữ liệu', 'Đang kiểm tra tính đầy đủ của bài học...')
      
      if(!isCompleteLesson(data)){
        updateProgress(75, 'Bổ sung nội dung', 'Đang bổ sung thêm nội dung cho bài học...')
        // fallback: ask AI to complete missing parts
        const prompt = `Bổ sung/hoàn thiện JSON sau đây để ĐẦY ĐỦ theo đúng schema đã mô tả trước đó. Trả về CHỈ JSON hợp lệ.\nJSON hiện tại:\n${JSON.stringify(data)}`
        const raw = await callSelectedAI(prompt)
        try{
          const completed = safeParseJSON(raw)
          if(isCompleteLesson(completed)){
            data = completed
          }
        }catch{
          const completed = await fixInvalidJSON(raw)
          if(isCompleteLesson(completed)){
            data = completed
          }
        }
      }
      
      updateProgress(90, 'Hoàn thiện', 'Đang hoàn thiện bài học...')
      // Check if Gemini was used
      const finalData = { ...data, createdAt: Date.now(), createdWithGemini: true, video: video }
      console.log('🎯 Final lesson data:', finalData)
      setLesson(finalData)
      setCurrentSection(1) // Reset to first section
      updateProgress(100, 'Hoàn thành', 'Bài học đã được tạo thành công!')
    }catch(e: any){
      updateProgress(0, 'Lỗi', 'Có lỗi xảy ra khi tạo bài học')
      alert(e.message || 'Có lỗi khi gọi AI')
    }finally{ setLoading(false) }
    setTimeout(()=> {
      updateProgress(0, '', '')
    }, 2000)
  }

  async function gradeUserSentence(){
    if(!lesson || !userSentence.trim()) return
    setGrading(true)
    setGradeResult(null)
    try{
      const prompt = `Bạn là giáo viên ngữ pháp. Hãy chấm câu do học viên tự viết dựa trên bài học sau. Trả về CHỈ JSON: {"ok": boolean, "feedback": string, "corrections": string}.
Bài học (tóm tắt grammar): ${JSON.stringify(lesson?.grammar||[])}
Câu của học viên: ${userSentence}`
      const raw = await callGemini(prompt)
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
Chủ đề: ${lesson?.title}
Grammar (tóm tắt): ${JSON.stringify((lesson?.grammar||[]).map((g:any)=>({title:g.title, patterns:g.patterns?.slice(0,3)||[], points:g.points?.slice(0,5)||[]})))}
Chỉ JSON, không markdown, không văn bản thừa.`
      const raw = await callGemini(prompt)
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
      toast.show('Đã đổi bộ câu hỏi')
    }catch(e:any){
      const msg = e?.message || 'Không đổi được bộ câu hỏi'
      toast.show(msg)
      alert('Không đổi được bộ câu hỏi')
    }finally{ setRegenLoading(false) }
  }

  // Save lesson to database
  const saveLessonToDB = async (lessonData: Lesson) => {
    if (!isAuthenticated) {
      toast.show('Vui lòng đăng nhập để lưu bài học')
      return
    }

    try {
      const response = await apiService.createLesson(lessonData)
      if (response.success) {
        toast.show('Đã lưu bài học vào database')
        setIsSavedLesson(true) // Mark as saved after successful save
        return response.data.lesson
      } else {
        toast.show('Lưu bài học thất bại: ' + response.message)
      }
    } catch (error) {
      toast.show('Có lỗi khi lưu bài học')
      console.error('Save lesson error:', error)
    }
  }

  const sections = [
    { id: 1, title: '1. Kiến thức ngữ pháp', content: (
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* YouTube Video Section */}
        {lesson?.video && (
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h4 className="font-semibold text-lg mb-3 text-slate-800">📺 Video học ngữ pháp</h4>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${lesson?.video?.videoId}`}
                title={lesson?.video?.title}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-sm text-slate-800 mb-1">{lesson?.video?.title}</h5>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>📺 {lesson?.video?.channel}</span>
                  <span>👀 {lesson?.video?.viewCount} lượt xem</span>
                </div>
              </div>
              <a 
                href={lesson?.video?.url} 
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
          <div key={i} className={i > 0 ? "mt-6 pt-6 border-t border-slate-200" : ""}>
            <h4 className="font-semibold text-lg mb-3 text-slate-800">{g.title}</h4>
            <p className="text-slate-600 text-sm mb-4">{g.summary}</p>
            
            {/* Dynamic content rendering - display exactly as AI generated */}
            <div className="space-y-4">
              {g.points?.map((point:string, j:number) => (
                <div key={j} className="text-sm text-slate-700 leading-relaxed">
                  {point}
                </div>
              ))}
            </div>
            
            {!!g.patterns?.length && (
              <div className="mt-4">
                <div className="text-slate-700 font-medium mb-2">Cấu trúc:</div>
                <div className="space-y-2">
                  {g.patterns.map((p:string,j:number)=>(
                    <div key={j} className="text-sm font-mono bg-slate-50 px-3 py-2 rounded border border-slate-200 text-slate-800">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.notes?.length && (
              <div className="mt-4">
                <div className="text-slate-700 font-medium mb-2">Ghi chú quan trọng:</div>
                <div className="space-y-2">
                  {g.notes.map((note:string,j:number)=>(
                    <div key={j} className="text-sm text-slate-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.time_markers?.length && (
              <div className="mt-4">
                <div className="text-slate-700 font-medium mb-2">Dấu hiệu nhận biết:</div>
                <div className="flex flex-wrap gap-2">
                  {g.time_markers.map((marker:string,j:number)=>(
                    <span key={j} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                      {marker}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.usage_contexts?.length && (
              <div className="mt-4">
                <div className="text-slate-700 font-medium mb-2">Cách sử dụng:</div>
                <div className="space-y-2">
                  {g.usage_contexts.map((context:string,j:number)=>(
                    <div key={j} className="text-sm text-slate-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
                      {context}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!!g.common_mistakes?.length && (
              <div className="mt-4">
                <div className="text-slate-700 font-medium mb-2">Lỗi thường gặp:</div>
                <div className="space-y-2">
                  {g.common_mistakes.map((mistake:string,j:number)=>(
                    <div key={j} className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
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
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-3 text-slate-800">Tạo bài học mới</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-md">
                <label className="text-xs text-slate-600">Tên bài học</label>
                <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="VD: Future Perfect, Present Perfect Continuous..." className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none text-slate-800" />
              </div>
              <button onClick={generate} disabled={loading} style={{color: 'white'}} className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 whitespace-nowrap">
                {loading ? 'Đang tạo...' : 'Tạo bằng AI'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="space-y-4">
        {loading && (
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{currentStep || 'Đang xử lý...'}</h4>
                  <p className="text-sm text-slate-600">{progressText || 'Vui lòng chờ trong giây lát...'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">{progress}%</div>
                <div className="text-xs text-slate-500">Hoàn thành</div>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-500 to-pink-400" style={{width: `${progress}%`}} />
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center">
              Đang sử dụng ✨ Gemini để tạo bài học
              <br />
              <span className="text-slate-400">Lưu ý: Video YouTube có thể không khả dụng do CORS policy</span>
            </div>
          </div>
        )}
        {loadingLesson && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải bài học...</p>
          </div>
        )}
        {!lesson && !loadingLesson && (
          <div className="text-slate-600 p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có bài học nào</h3>
            <p className="text-slate-500">Nhập tên bài học và bấm "Tạo bằng AI" để bắt đầu.</p>
          </div>
        )}
        {!!lesson && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{lesson?.title}</h2>
                <div className="flex items-center gap-4 text-slate-600 text-sm">
                  <span>Level: {lesson?.level}</span>
                  <span className="px-2 py-1 rounded-full bg-purple-600/20 text-purple-600 text-xs border border-purple-500/30">
                    ✨ Powered by Gemini
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!isSavedLesson && (
                  <button onClick={()=> saveLessonToDB(lesson)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">Lưu bài học</button>
                )}
                {isSavedLesson && (
                  <span className="px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
                    ✅ Đã lưu trong database
                  </span>
                )}
                <button onClick={()=> { setLesson(null); setIsSavedLesson(false); toast.show('Đã xóa bài học hiện tại') }} className="px-3 py-2 rounded-lg border border-red-500/20 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200">Xóa bài học</button>
              </div>
            </div>
            <section className="space-y-2">
              <h3 className="font-semibold">Mục tiêu</h3>
              <div className="flex flex-wrap gap-2">
                {(lesson?.objectives||[]).map((o: string,i:number)=>(<span key={i} className="px-2 py-1 rounded-full text-xs border border-slate-200 bg-slate-50 text-slate-700">{o}</span>))}
              </div>
            </section>
            
            {/* Section Navigation */}
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-200 backdrop-blur-sm">
              <div className="flex gap-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                      currentSection === section.id 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              {currentSection < 3 && (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 shadow-sm"
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


