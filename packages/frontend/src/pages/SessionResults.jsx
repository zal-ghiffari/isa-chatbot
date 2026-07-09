import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getSessionInfo, getSessionResults } from '../api/client'
import { getAvatarById } from '../data/avatars'
import RespondentModal from '../components/admin/RespondentModal'

const gradeColors = { A: '#059669', B: '#004ac6', C: '#d97706', D: '#e11d48' }
const gradeBadge = { A: 'bg-emerald-50 text-emerald-600', B: 'bg-blue-50 text-blue-600', C: 'bg-amber-50 text-amber-600', D: 'bg-red-50 text-red-600' }

export default function SessionResults() {
  const { token } = useParams()
  const [session, setSession] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedResp, setSelectedResp] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [s, r] = await Promise.all([getSessionInfo(token), getSessionResults(token)])
        setSession(s.data); setResults(r.data)
      } catch {} finally { setLoading(false) }
    })()
  }, [token])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><p className="text-gray-500">Sesi tidak ditemukan</p>
        <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline mt-2 inline-block">← Dashboard</Link></div>
    </div>
  )

  const gradeData = (results?.grade_distribution || []).map(g => ({ name: g.grade, value: g.count, color: gradeColors[g.grade] || '#94a3b8' }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Token: <span className="font-mono text-primary font-semibold">{session.token}</span></p>
          </div>
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span> Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Peserta', value: results?.total_participants || 0, icon: 'groups' },
            { label: 'Selesai', value: results?.completed || 0, icon: 'assignment_turned_in' },
            { label: 'Rata-rata Skor', value: results?.average_score || 0, icon: 'analytics' },
            { label: 'Partisipasi', value: results?.total_participants ? Math.round((results.completed / results.total_participants) * 100) + '%' : '0%', icon: 'trending_up' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{c.label}</span>
                <span className="material-symbols-outlined text-gray-400">{c.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Distribusi Grade</h3>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={gradeData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" strokeWidth={0}>
                    {gradeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8 text-sm">Belum ada data</p>}
            <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
              {gradeData.map(g => (
                <span key={g.name} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} /> {g.name} ({g.value})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Daftar Peserta</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instansi</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(results?.participants || []).length === 0
                    ? <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Belum ada peserta</td></tr>
                    : results?.participants.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs" style={{ backgroundColor: getAvatarById(p.avatar).bg }}>
                                <span role="img" aria-label={getAvatarById(p.avatar).label}>{getAvatarById(p.avatar).emoji}</span>
                              </div>
                              <span className="font-medium text-gray-900">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{p.institution || '-'}</td>
                          <td className="px-5 py-3.5 font-semibold text-gray-700">{p.total_score || '-'}</td>
                          <td className="px-5 py-3.5">{p.grade ? <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${gradeBadge[p.grade] || 'bg-gray-100 text-gray-500'}`}>{p.grade}</span> : '-'}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => setSelectedResp(p.id)}
                              className="text-primary hover:text-blue-800 text-sm font-medium">Detail</button>
                          </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedResp && <RespondentModal respondentId={selectedResp} onClose={() => setSelectedResp(null)} />}
    </div>
  )
}
