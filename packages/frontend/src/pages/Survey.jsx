import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getCurrentQuestion, answerQuestion } from '../api/client'

const topicLabels = {
  social_engineering: '🔒 Rekayasa Sosial',
  negative_content: '📱 Dampak Konten Negatif',
}

const scoreBtn = {
  1: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
  2: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100',
  3: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100',
  4: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
}

export default function Survey() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session')
  const bottomRef = useRef(null)

  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [totalQ, setTotalQ] = useState(20)
  const [isAnswering, setIsAnswering] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Selamat datang di SadarSiber.ID! Saya akan menanyakan 20 pertanyaan tentang keamanan siber. Klik tombol di bawah untuk mulai.' },
  ])

  useEffect(() => {
    if (!sessionId) navigate('/')
  }, [sessionId, navigate])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages, currentQ])

  const addBotMsg = (text) => setMessages((prev) => [...prev, { role: 'bot', text }])
  const addUserMsg = (text) => setMessages((prev) => [...prev, { role: 'user', text }])

  const showQuestion = (q) => {
    const topic = q.topic === 'social_engineering' ? '🔒 Rekayasa Sosial' : '📱 Dampak Konten Negatif'
    addBotMsg(`**Pertanyaan ${q.order_num} — ${topic}**\n\n${q.question_text}`)
  }

  const startSurvey = async () => {
    setStarted(true)
    addBotMsg('Baik, mari kita mulai! 🎯')
    try {
      const { data } = await getCurrentQuestion(sessionId)
      setTotalQ(data.total)
      setCurrentQ(data.question)
      showQuestion(data.question)
      setIsAnswering(true)
    } catch (err) {
      addBotMsg(`❌ Gagal memuat pertanyaan: ${err.response?.data?.detail || err.message}`)
    }
  }

  const handleAnswer = async (score) => {
    if (!isAnswering || !currentQ) return
    setIsAnswering(false)
    addUserMsg(`${score}. ${currentQ[`scale_${score}`]}`)
    setAnsweredCount((prev) => prev + 1)
    setMessages((prev) => [...prev, { role: 'typing' }])

    try {
      const { data } = await answerQuestion(sessionId, currentQ.id, score)
      setMessages((prev) => prev.filter((m) => m.role !== 'typing'))
      if (data.done) {
        setCurrentQ(null)
        addBotMsg('✅ Survey selesai! Menghitung hasil...')
        setLoading(true)
        setTimeout(() => navigate(`/result/${sessionId}`), 1500)
      } else {
        addBotMsg('Lanjut ke pertanyaan berikutnya ⏭️')
        setTimeout(async () => {
          try {
            const qData = await getCurrentQuestion(sessionId)
            if (qData.data.done) {
              setCurrentQ(null)
              addBotMsg('✅ Survey selesai! Menghitung hasil...')
              setLoading(true)
              setTimeout(() => navigate(`/result/${sessionId}`), 1500)
              return
            }
            setCurrentQ(qData.data.question)
            showQuestion(qData.data.question)
            setIsAnswering(true)
          } catch {
            addBotMsg('❌ Gagal memuat pertanyaan')
            setIsAnswering(true)
          }
        }, 400)
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.role !== 'typing'))
      addBotMsg(`❌ ${err.response?.data?.detail || err.message}`)
      setIsAnswering(true)
    }
  }

  if (!sessionId) return null

  const progress = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0
  const circleLen = 2 * Math.PI * 15
  const offset = circleLen - (progress / 100) * circleLen

  return (
    <div className="h-dvh flex flex-col bg-gray-50 max-w-lg mx-auto shadow-sm">
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 p-1 -ml-1">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">SadarSiber.ID</span>
        </div>
        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke={progress === 100 ? '#059669' : progress > 50 ? '#004ac6' : '#d97706'} strokeWidth="3" strokeDasharray={circleLen} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <span className="absolute text-[10px] font-bold text-gray-500">{answeredCount}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg, i) => (
          msg.role === 'typing' ? (
            <div key={i} className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-gray-400 text-base">smart_toy</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          ) : msg.role === 'bot' ? (
            <div key={i} className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-base">smart_toy</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 shadow-sm leading-relaxed">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>{line}<br /></span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="flex items-end gap-2 max-w-[80%] flex-row-reverse">
                <div className="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm shadow-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            </div>
          )
        ))}
        <div ref={bottomRef} />
      </main>

      <div className="shrink-0 bg-white border-t border-gray-200 px-4 py-3 pb-5">
        {currentQ && isAnswering ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400">{topicLabels[currentQ.topic]}</span>
              <span className="text-[11px] text-gray-400">Q{currentQ.order_num}/{totalQ}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 text-center">Pilih jawaban Anda:</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((s) => {
                const label = currentQ[`scale_${s}`]
                return (
                  <button key={s} onClick={() => handleAnswer(s)}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 h-[72px] text-sm font-medium transition-all active:scale-95 ${scoreBtn[s]}`}>
                    <span className={`text-lg font-bold ${s === 4 ? 'text-white' : ''}`}>{s}</span>
                    <span className={`text-[9px] leading-tight mt-0.5 px-1 text-center line-clamp-2 ${s === 4 ? 'text-white/90' : ''}`}>{label}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalQ }).map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i < answeredCount ? 'w-3 bg-primary' : i === answeredCount ? 'w-3 bg-primary/40' : 'w-1.5 bg-gray-200'}`} />
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menghitung hasil...
            </div>
          </div>
        ) : !started ? (
          <button onClick={startSurvey}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-md hover:brightness-90 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">play_arrow</span> Mulai Survey
          </button>
        ) : null}
      </div>
    </div>
  )
}
