import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { getResult } from '../api/client'

const gradeColors = {
  A: { bg: 'from-emerald-600 to-green-600', label: 'Sangat Baik (Expert)', desc: 'Pemahaman Anda sangat baik! Anda memiliki kesadaran komprehensif tentang keamanan informasi dan dampak konten negatif. Anda siap menjadi agen literasi digital.' },
  B: { bg: 'from-blue-600 to-blue-700', label: 'Baik (Proficient)', desc: 'Pemahaman Anda sudah baik. Anda memahami konsep utama rekayasa sosial dan dampak konten negatif. Tingkatkan pengetahuan di beberapa aspek untuk mencapai level expert.' },
  C: { bg: 'from-amber-500 to-orange-600', label: 'Cukup (Aware)', desc: 'Kesadaran dasar sudah terbentuk. Anda memahami risiko namun perlu edukasi lanjutan untuk memperkuat pemahaman tentang keamanan informasi dan literasi digital.' },
  D: { bg: 'from-red-500 to-rose-600', label: 'Kurang (Beginner)', desc: 'Anda masih perlu meningkatkan pemahaman tentang rekayasa sosial dan dampak konten negatif. Kami sarankan mengikuti pelatihan dasar keamanan informasi dan literasi digital.' },
}

export default function Result() {
  const { sessionId } = useParams()
  const certRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
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
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  const handleDownload = async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#1e293b',
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `sertifikat-sadarsiber-${data.respondent.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch {}
    setDownloading(false)
  }

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
  const certTitle = data.session?.title || 'SadarSiber.ID'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{'\uD83C\uDF89'} Hasil Assessment</h1>
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
          <h3 className="font-semibold text-gray-800 mb-4">{'\uD83D\uDCCA'} Rincian Skor per Topik</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{'\uD83D\uDD12'} Rekayasa Sosial</span>
                <span className="text-gray-600">{data.se_score}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: seBar }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Rata-rata: {data.se_avg} / 4</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{'\uD83D\uDCF1'} Dampak Konten Negatif</span>
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
          <h3 className="font-semibold text-gray-800 mb-2">{'\uD83D\uDCA1'} Rekomendasi</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{gc.desc}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">{'\uD83D\uDCDC'} Sertifikat</h3>
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:brightness-90 transition-all disabled:opacity-60">
              {downloading ? (
                <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Mendownload...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">download</span> Download</>
              )}
            </button>
          </div>
          <div ref={certRef} className="relative overflow-hidden rounded-xl border-2 border-primary/20" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="relative px-6 py-5 text-center">
              <div className="mb-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/70 font-medium">Sertifikat Partisipasi</p>
              <p className="text-lg font-bold text-white mt-1">{certTitle}</p>
              <div className="w-16 h-0.5 bg-primary/50 mx-auto my-3 rounded-full" />
              <p className="text-xs text-blue-200/60">Diberikan kepada</p>
              <p className="text-xl font-bold text-white my-2">{data.respondent.name}</p>
              <p className="text-[11px] text-blue-200/60 max-w-xs mx-auto">Telah berpartisipasi dan menyelesaikan asesmen kesadaran keamanan siber yang mencakup pemahaman terhadap ancaman rekayasa sosial serta kemampuan mengidentifikasi dan menyikapi konten negatif di media sosial.</p>
              <div className="flex justify-center items-center gap-5 my-4">
                <div className="text-center">
                  <p className="text-[10px] text-blue-200/50 uppercase tracking-wide">Grade</p>
                  <p className="text-2xl font-black text-white mt-0.5">{data.grade}</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-blue-200/50 uppercase tracking-wide">Skor</p>
                  <p className="text-lg font-bold text-white mt-0.5">{data.total_score}/100</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-blue-200/50 uppercase tracking-wide">Tanggal</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{today}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">shield</span>
                <span className="text-[10px] text-blue-200/40">Sertifikat diterbitkan oleh SadarSiber.ID</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Link to="/"
            className="flex-1 text-center py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
            {'\u2190'} Kembali ke Beranda
          </Link>
          <span
            className="flex-1 text-center py-3 bg-gray-100 text-gray-500 font-medium rounded-xl text-sm opacity-50">
            {'\u2705'} Sudah dikerjakan
          </span>
        </div>
      </div>
    </div>
  )
}
