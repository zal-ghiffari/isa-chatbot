import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMySessions, getUserSurveys } from '../api/client'
import { getAvatarById } from '../data/avatars'

const gradeBadge = { A: 'bg-emerald-50 text-emerald-600', B: 'bg-blue-50 text-blue-600', C: 'bg-amber-50 text-amber-600', D: 'bg-red-50 text-red-600' }

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [surveys, setSurveys] = useState([])
  const [tab, setTab] = useState('sessions')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    ;(async () => {
      try {
        const [a, b] = await Promise.all([getMySessions(), getUserSurveys()])
        setSessions(a.data)
        setSurveys(b.data)
      } catch {} finally { setLoading(false) }
    })()
  }, [user, navigate])

  if (!user) return <Navigate to="/login" replace />

  const completed = surveys.filter(s => s.grade).length

  const navItems = [
    { key: 'sessions', label: 'Dashboard', icon: 'dashboard' },
    { key: 'surveys', label: 'History', icon: 'assignment' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 fixed top-0 left-0 right-0 z-20">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><span className="material-symbols-outlined">menu</span></button>
        <div className="text-base font-bold text-primary">SadarSiber.ID</div>
        <div className="w-6" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-14 h-full w-64 bg-white border-r border-gray-200 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button key={item.key} onClick={() => { setTab(item.key); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${tab === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <span className="material-symbols-outlined">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 z-30">
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-bold text-primary">SadarSiber.ID</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${tab === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="material-symbols-outlined">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">{user.name.charAt(0)}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
          {user.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-1">
              <span className="material-symbols-outlined">admin_panel_settings</span> Admin Panel
            </Link>
          )}
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            <span className="material-symbols-outlined">home</span> Home
          </Link>
          <button onClick={() => { logout(); navigate('/') }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mt-1">
            <span className="material-symbols-outlined">logout</span> Logout
          </button>
        </div>
      </aside>

      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back. Here is the status of your cybersecurity assessments.</p>
            </div>
            <Link to="/sessions/create" className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:brightness-90 transition-colors shadow-sm shrink-0">
              <span className="material-symbols-outlined text-lg">add</span> Buat Sesi
            </Link>
          </div>

          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Sessions', value: sessions.length, icon: 'sensors', color: 'bg-blue-50 text-blue-600' },
                { label: 'Total Surveys', value: surveys.length, icon: 'assignment', color: 'bg-gray-100 text-gray-600' },
                { label: 'Completed', value: completed, icon: 'check_circle', color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Avg Score', value: completed > 0 ? Math.round(surveys.filter(s => s.grade).reduce((sum, s) => sum + s.total_score, 0) / completed) : '-', icon: 'grade', color: 'bg-indigo-50 text-indigo-600' },
              ].map((c) => (
                <div key={c.label} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{c.label}</span>
                    <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-lg">{c.icon}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100">
            <div className="border-b border-gray-100 px-5 pt-4 flex gap-2">
              <button onClick={() => setTab('sessions')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'sessions' ? 'bg-white text-primary border-b-2 border-primary -mb-[1px]' : 'text-gray-400 hover:text-gray-600'}`}>
                Sesi Saya
              </button>
              <button onClick={() => setTab('surveys')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'surveys' ? 'bg-white text-primary border-b-2 border-primary -mb-[1px]' : 'text-gray-400 hover:text-gray-600'}`}>
                Riwayat Survey
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : tab === 'sessions' ? (
                sessions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">quiz</span>
                    <p className="text-sm">Belum ada sesi. Buat sesi baru untuk memulai.</p>
                    <Link to="/sessions/create" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">Buat Sesi Baru</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-blue-600">shield</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{s.participant_count} Participants · Token: <span className="font-mono text-primary">{s.token}</span></p>
                          </div>
                        </div>
                        <Link to={`/sessions/${s.token}/results`} className="text-sm text-primary hover:text-blue-800 font-medium shrink-0 flex items-center gap-1">
                          Results <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                surveys.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">assignment</span>
                    <p className="text-sm">Belum ada riwayat survey.</p>
                    <Link to="/" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">Ikuti Survey</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {surveys.map((s, i) => {
                      const av = getAvatarById(s.avatar)
                      return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: av.bg }}>
                              <span role="img" aria-label={av.label}>{av.emoji}</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">{s.name}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">{s.institution || s.email || '-'}</p>
                              {s.session_title && <p className="text-xs text-blue-500 mt-0.5">Sesi: {s.session_title}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {s.grade ? (
                              <>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${gradeBadge[s.grade] || 'bg-gray-100 text-gray-500'}`}>{s.grade}</span>
                                <span className="text-sm font-semibold text-gray-700">{s.total_score}</span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">Pending</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20">
        {navItems.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${tab === item.key ? 'text-primary' : 'text-gray-400'}`}>
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
