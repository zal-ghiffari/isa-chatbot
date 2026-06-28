import { useState, useEffect } from 'react'
import { getRespondentDetail } from '../../api/client'

const gradeBg = { A: 'bg-emerald-600', B: 'bg-blue-600', C: 'bg-amber-500', D: 'bg-red-500' }
const scoreBadge = {
  1: 'bg-red-50 text-red-600 border-red-200',
  2: 'bg-amber-50 text-amber-600 border-amber-200',
  3: 'bg-blue-50 text-blue-600 border-blue-200',
  4: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}
const topicStyle = {
  social_engineering: 'text-blue-600',
  negative_content: 'text-amber-600',
}

export default function RespondentModal({ respondentId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: d } = await getRespondentDetail(respondentId)
        setData(d)
      } catch {} finally { setLoading(false) }
    })()
  }, [respondentId])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Detail Responden</h2>
            {data && <p className="text-xs text-gray-400 mt-0.5">ID: RS-{String(data.respondent.id).padStart(4, '0')}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-blue-500">person</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{data.respondent.name}</h3>
                  {data.respondent.email && <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-base">mail</span> {data.respondent.email}</p>}
                  {data.respondent.institution && <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-base">business</span> {data.respondent.institution}</p>}
                  {[data.respondent.city, data.respondent.province].filter(Boolean).length > 0 && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-base">location_on</span> {[data.respondent.city, data.respondent.province].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
              {data.assessment && (
                <div className={`${gradeBg[data.assessment.grade] || 'bg-gray-500'} text-white px-5 py-3 rounded-xl flex flex-col items-center min-w-[120px]`}>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Grade</span>
                  <span className="text-3xl font-black">{data.assessment.grade}</span>
                  <span className="text-xs mt-0.5">{data.assessment.total_score}%</span>
                </div>
              )}
            </div>

            {data.assessment && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Skor per Topik</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Social Engineering</span>
                      <span className="text-sm font-bold text-emerald-600">{data.assessment.se_score}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${data.assessment.se_score}%` }} />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Negative Content</span>
                      <span className="text-sm font-bold text-amber-600">{data.assessment.nc_score}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${data.assessment.nc_score}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Jawaban ({data.answers?.length || 0})</h4>
              <div className="space-y-2">
                {(data.answers || []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Belum ada jawaban</p>
                ) : (data.answers || []).slice(0, 10).map((a, i) => {
                  const label = a.score >= 3 ? 'Benar' : a.score === 2 ? 'Sebagian' : 'Salah'
                  return (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Q{a.order_num}</span>
                            <span className={`text-[11px] font-medium ${topicStyle[a.topic] || 'text-gray-500'}`}>{a.topic === 'social_engineering' ? 'SE' : 'NC'}</span>
                          </div>
                          <p className="text-sm text-gray-800">{a.question_text}</p>
                          <p className="text-xs text-gray-400 mt-1">Jawaban: {a[`scale_${a.score}`]}</p>
                        </div>
                        <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${scoreBadge[a.score] || 'bg-gray-100 text-gray-500'}`}>
                          {label} ({a.score})
                        </span>
                      </div>
                    </div>
                  )
                })}
                {(data.answers || []).length > 10 && (
                  <p className="text-xs text-gray-400 text-center pt-2">Menampilkan 10 dari {data.answers.length} jawaban</p>
                )}
              </div>
            </div>

            {data.assessment && (
              <div className="relative overflow-hidden rounded-xl border-2 border-primary/20" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative px-6 py-5 text-center">
                  <div className="mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-2">
                      <span className="material-symbols-outlined text-primary-fixed text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/70 font-medium">Sertifikat Partisipasi</p>
                  <p className="text-lg font-bold text-white mt-1">SadarSiber.ID</p>
                  <div className="w-16 h-0.5 bg-primary/50 mx-auto my-3 rounded-full" />
                  <p className="text-xs text-blue-200/60">Diberikan kepada</p>
                  <p className="text-xl font-bold text-white my-2">{data.respondent.name}</p>
                  <p className="text-[11px] text-blue-200/60 max-w-xs mx-auto">Atas partisipasi dalam asesmen kesadaran keamanan siber</p>
                  <div className="flex justify-center items-center gap-5 my-4">
                    <div className="text-center">
                      <p className="text-[10px] text-blue-200/50 uppercase tracking-wide">Grade</p>
                      <p className="text-2xl font-black text-white mt-0.5">{data.assessment.grade}</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[10px] text-blue-200/50 uppercase tracking-wide">Skor</p>
                      <p className="text-lg font-bold text-white mt-0.5">{data.assessment.total_score}/100</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[10px] text-blue-200/50 uppercase tracking-wide">Tanggal</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{data.assessment.completed_at}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-primary-fixed text-sm">shield</span>
                    <span className="text-[10px] text-blue-200/40">SadarSiber.ID Cybersecurity Assessment</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">Data tidak ditemukan</div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:brightness-90 transition-all">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
