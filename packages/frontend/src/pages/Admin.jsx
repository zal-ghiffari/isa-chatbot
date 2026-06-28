import { useState, useEffect, useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getAdminStats, getAdminUsers, getAdminSessions } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import RespondentModal from '../components/admin/RespondentModal'

const scoreClass = { A: 'bg-emerald-50 text-emerald-600', B: 'bg-blue-50 text-blue-600', C: 'bg-amber-50 text-amber-600', D: 'bg-red-50 text-red-600' }
const gradeColors = { A: '#059669', B: '#004ac6', C: '#d97706', D: '#e11d48' }
const qColors = { social_engineering: '#3b82f6', negative_content: '#10b981' }

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState(null)
  const [usersData, setUsersData] = useState([])
  const [sessionsData, setSessionsData] = useState([])
  const [err, setErr] = useState('')
  const [selectedResp, setSelectedResp] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('dashboard')
  const [loaded, setLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const filteredRecent = useMemo(() => {
    if (!stats?.recent) return []
    if (!search) return stats.recent
    const q = search.toLowerCase()
    return stats.recent.filter(r => (r.name || '').toLowerCase().includes(q) || (r.institution || '').toLowerCase().includes(q) || (r.province || '').toLowerCase().includes(q))
  }, [stats, search])

  const geoData = useMemo(() => {
    if (!stats?.geography) return []
    const map = {}
    stats.geography.forEach((g) => {
      if (!g.province) return
      if (!map[g.province]) map[g.province] = { province: g.province, total: 0, score: 0, n: 0 }
      map[g.province].total += g.total || 0
      map[g.province].score += (g.avg_score || 0) * (g.total || 0)
      map[g.province].n += g.total || 0
    })
    return Object.values(map)
  }, [stats])

  useEffect(() => {
    if (authLoading || !user || !isAdmin || loaded) return
    ;(async () => {
      try {
        const { data } = await getAdminStats()
        setStats(data)
        const [u, s] = await Promise.allSettled([getAdminUsers(), getAdminSessions()])
        if (u.status === 'fulfilled') setUsersData(u.value.data)
        if (s.status === 'fulfilled') setSessionsData(s.value.data)
      } catch (e) { setErr(e?.response?.data?.detail || e?.message || 'Gagal') }
      setLoaded(true)
    })()
  }, [authLoading, user, isAdmin, loaded])

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />
  if (!isAdmin) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-sm text-center max-w-sm border border-gray-100">
        <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500">block</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Akses Ditolak</h2>
        <p className="text-sm text-gray-500 mb-4">Halaman ini hanya untuk admin.</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-90">Ke Dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-primary mb-8">SadarSiber.ID</div>
            <div className="space-y-1">
              {['dashboard', 'users', 'sessions'].map((t) => (
                <button key={t} onClick={() => { setTab(t); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${tab === t ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="material-symbols-outlined">{t === 'dashboard' ? 'dashboard' : t === 'users' ? 'groups' : 'analytics'}</span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 z-30">
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-bold text-primary">SadarSiber.ID</div>
          <div className="text-xs text-gray-400 mt-1">Admin Panel</div>
        </div>
        <div className="p-4">
          <Link to="/sessions/create" className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:brightness-90 transition-colors">
            <span className="material-symbols-outlined text-lg">add</span> New Survey
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {['dashboard', 'users', 'sessions'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${tab === t ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="material-symbols-outlined">{t === 'dashboard' ? 'dashboard' : t === 'users' ? 'groups' : 'analytics'}</span>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            <span className="material-symbols-outlined">logout</span> Back to Home
          </Link>
        </div>
      </aside>

      <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 fixed top-0 left-0 right-0 z-20">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><span className="material-symbols-outlined">menu</span></button>
        <div className="text-base font-bold text-primary">SadarSiber.ID</div>
        <div className="w-6" />
      </div>

      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
              <span>{err}</span>
              <button onClick={() => { setErr(''); setLoaded(false) }} className="text-red-600 font-medium hover:underline">Coba Lagi</button>
            </div>
          )}

          {!stats ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-500">System overview and respondent metrics.</p>
                </div>
                <div className="flex bg-gray-100 p-0.5 rounded-lg">
                  {['dashboard', 'users', 'sessions'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {{ dashboard: 'Dashboard', users: 'Users', sessions: 'Sessions' }[t]}
                    </button>
                  ))}
                </div>
              </div>

              {tab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Respondents', value: stats.total_respondents, icon: 'groups' },
                      { label: 'Completed', value: stats.completed_assessments, icon: 'assignment_turned_in' },
                      { label: 'Active Sessions', value: stats.total_sessions || 0, icon: 'devices' },
                      { label: 'Avg Score', value: stats.average_score + '%', icon: 'analytics' },
                    ].map((c) => (
                      <div key={c.label} className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{c.label}</span>
                          <span className="material-symbols-outlined text-gray-400">{c.icon}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Distribusi Grade</h3>
                      {(stats.grade_distribution || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie data={stats.grade_distribution.map(g => ({ ...g, color: gradeColors[g.grade] || '#94a3b8' }))}
                              cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" strokeWidth={0}>
                              {stats.grade_distribution.map((g, i) => <Cell key={i} fill={gradeColors[g.grade] || '#94a3b8'} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-400 py-12 text-sm">Belum ada data</p>}
                      <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
                        {stats.grade_distribution.map(g => (
                          <span key={g.grade} className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gradeColors[g.grade] }} />
                            {g.grade} ({g.label}) — {g.count}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Skor per Pertanyaan</h3>
                      {(stats.per_question || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={(stats.per_question || []).slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="order_num" tickFormatter={(v) => `Q${v}`} fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="avg_score" radius={[4, 4, 0, 0]} barSize={20}>
                              {(stats.per_question || []).slice(0, 10).map((e, i) => <Cell key={i} fill={qColors[e.topic] || '#3b82f6'} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-400 py-12 text-sm">Belum ada data</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Sebaran Geografis Responden</h3>
                    {geoData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={Math.max(200, geoData.length * 35)}>
                        <BarChart data={[...geoData].sort((a, b) => b.total - a.total).slice(0, 15)} layout="vertical" margin={{ left: 100, right: 30, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="province" fontSize={11} tickLine={false} axisLine={false} width={90} />
                          <Tooltip formatter={(value) => [value, 'Responden']} />
                          <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={18}>
                            {[...geoData].sort((a, b) => b.total - a.total).slice(0, 15).map((p, i) => {
                              const avg = p.n > 0 ? p.score / p.n : 0
                              const col = avg >= 80 ? '#059669' : avg >= 65 ? '#004ac6' : avg >= 50 ? '#d97706' : '#e11d48'
                              return <Cell key={i} fill={col} />
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-gray-400 py-12 text-sm">Belum ada data geografis</p>}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100">
                    <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h2 className="text-base font-semibold text-gray-900">Recent Respondents</h2>
                      <div className="flex gap-2">
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-full sm:w-56"
                            placeholder="Search..." />
                        </div>
                        <button onClick={async () => {
                          const { data } = await getAdminStats()
                          const rows = ['Name,Institution,Score,Grade', ...(data.recent || []).map(r => [r.name, r.institution, r.total_score, r.grade].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))]
                          const b = new Blob([rows.join('\n')], { type: 'text/csv' })
                          const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'respondents.csv'; a.click()
                        }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <span className="material-symbols-outlined text-lg">download</span> Export
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredRecent.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">{search ? 'No results' : 'No data yet'}</td></tr>
                          ) : filteredRecent.map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-medium text-gray-900">{r.name}</div>
                                <div className="text-xs text-gray-400">{r.email || '-'}</div>
                              </td>
                              <td className="px-5 py-3.5 text-gray-500">{r.institution || '-'}</td>
                              <td className="px-5 py-3.5 text-gray-500">{r.province || '-'}</td>
                              <td className="px-5 py-3.5">
                                {r.grade ? (
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreClass[r.grade] || 'bg-gray-100 text-gray-600'}`}>
                                    {r.total_score || '-'}%
                                  </span>
                                ) : <span className="text-gray-400">-</span>}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button onClick={() => setSelectedResp(r.respondent_id || r.id)}
                                  className="text-primary hover:text-blue-800 text-sm font-medium transition-colors">Detail</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                      Showing {Math.min(filteredRecent.length, 20)} entries
                    </div>
                  </div>
                </>
              )}

              {tab === 'users' && (
                <div className="bg-white rounded-xl border border-gray-100">
                  <div className="p-5 border-b border-gray-100"><h2 className="text-base font-semibold text-gray-900">Registered Users</h2></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {usersData.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No users</td></tr>
                        : usersData.map((u, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-5 py-3.5 font-medium text-gray-900">{u.name}</td>
                            <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                            <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>{u.role}</span></td>
                            <td className="px-5 py-3.5 text-gray-500">{u.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'sessions' && (
                <div className="space-y-3">
                  {sessionsData.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-400">No sessions yet</div>
                  ) : sessionsData.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{s.title}</h4>
                          {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">vpn_key</span> <strong className="font-mono text-primary">{s.token}</strong></span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span> {s.creator_name}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">groups</span> {s.participant_count} participants</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {s.created_at}</span>
                          </div>
                        </div>
                        <Link to={`/sessions/${s.token}/results`} className="text-sm text-primary hover:text-blue-800 font-medium shrink-0 flex items-center gap-1">
                          Results <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedResp && <RespondentModal respondentId={selectedResp} onClose={() => setSelectedResp(null)} />}
    </div>
  )
}
