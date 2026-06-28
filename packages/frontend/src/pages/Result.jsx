import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResult } from '../api/client'

const gradeColors = {
  A: { bg: 'from-emerald-600 to-green-600', label: 'Sangat Baik (Expert)', desc: 'Pemahaman Anda sangat baik! Anda memiliki kesadaran komprehensif tentang keamanan informasi dan dampak konten negatif. Anda siap menjadi agen literasi digital.' },
  B: { bg: 'from-blue-600 to-blue-700', label: 'Baik (Proficient)', desc: 'Pemahaman Anda sudah baik. Anda memahami konsep utama rekayasa sosial dan dampak konten negatif. Tingkatkan pengetahuan di beberapa aspek untuk mencapai level expert.' },
  C: { bg: 'from-amber-500 to-orange-600', label: 'Cukup (Aware)', desc: 'Kesadaran dasar sudah terbentuk. Anda memahami risiko namun perlu edukasi lanjutan untuk memperkuat pemahaman tentang keamanan informasi dan literasi digital.' },
  D: { bg: 'from-red-500 to-rose-600', label: 'Kurang (Beginner)', desc: 'Anda masih perlu meningkatkan pemahaman tentang rekayasa sosial dan dampak konten negatif. Kami sarankan mengikuti pelatihan dasar keamanan informasi dan literasi digital.' },
}

export default function Result() {
  const { sessionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seBar, setSeBar] = useState('0%')
  const [ncBar, setNcBar] = useState('0%')

  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      try {
        const { data: result } = await getResult(sessionId)
        setData(result)
        setTimeout(() => {
          setSeBar(result.se_score + '%')
          setNcBar(result.nc_score + '%')
        }, 200)
      } catch {
        // handled by empty state
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">Memuat hasil assessment...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-500">Hasil tidak ditemukan.</p>
      </div>
    )
  }

  const gc = gradeColors[data.grade] || gradeColors.D
  const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">🎉 Hasil Assessment</h1>
          <p className="text-gray-500 text-sm mt-1">Survey Kesadaran Digital</p>
        </div>

        <div className={`text-white rounded-2xl p-6 text-center shadow-xl bg-gradient-to-r ${gc.bg}`}>
          <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Grade Anda</p>
          <div className="text-6xl font-black mb-1">{data.grade}</div>
          <p className="text-lg font-semibold">{gc.label}</p>
          <div className="mt-3 flex justify-center items-baseline gap-1">
            <span className="text-3xl font-bold">{data.total_score}</span>
            <span className="text-blue-200">/ 100</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">📊 Rincian Skor per Topik</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">🔒 Rekayasa Sosial</span>
                <span className="text-gray-600">{data.se_score}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: seBar }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Rata-rata: {data.se_avg} / 4</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">📱 Dampak Konten Negatif</span>
                <span className="text-gray-600">{data.nc_score}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: ncBar }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Rata-rata: {data.nc_avg} / 4</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Rekomendasi</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{gc.desc}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">📜 Sertifikat</h3>
          <div id="certificate" className="rounded-xl p-6 text-center shadow-sm" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', border: '3px double #1e3a5f' }}>
            <div className="border-b-2 border-gray-300 pb-4 mb-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">Sertifikat Partisipasi</p>
              <p className="text-lg font-bold text-gray-800 mt-1">Survey Kesadaran Digital</p>
            </div>
            <p className="text-sm text-gray-600">Diberikan kepada:</p>
            <p className="text-xl font-bold text-gray-800 my-2">{data.respondent.name}</p>
            <p className="text-xs text-gray-500">Atas partisipasinya dalam mengisi kuesioner kesadaran</p>
            <p className="text-sm font-medium text-gray-700">Rekayasa Sosial & Dampak Konten Negatif di Media Sosial</p>
            <div className="flex justify-center items-center gap-6 my-4">
              <div>
                <p className="text-xs text-gray-400">Grade</p>
                <p className="text-2xl font-black text-blue-600">{data.grade}</p>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <p className="text-xs text-gray-400">Skor</p>
                <p className="text-xl font-bold text-gray-700">{data.total_score}/100</p>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <p className="text-xs text-gray-400">Tanggal</p>
                <p className="text-sm font-semibold text-gray-700">{today}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Sertifikat ini diterbitkan secara otomatis oleh sistem.</p>
            <p className="text-xs text-gray-400">{data.respondent.institution || 'Peserta Survey Kesadaran Digital'}</p>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Link to="/"
            className="flex-1 text-center py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
            ← Kembali ke Beranda
          </Link>
          <span
            className="flex-1 text-center py-3 bg-gray-100 text-gray-500 font-medium rounded-xl text-sm opacity-50">
            ✅ Sudah dikerjakan
          </span>
        </div>
      </div>
    </div>
  )
}
