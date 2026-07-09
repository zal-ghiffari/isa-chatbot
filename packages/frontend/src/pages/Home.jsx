import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { startSurvey, getAdminStats } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import AVATARS, { getRandomAvatar } from '../data/avatars'
import regions from '../data/regions'

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getAdminStats().then(({ data }) => setStats(data)).catch(() => {})
  }, [])
  const [avatar, setAvatar] = useState(getRandomAvatar)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', institution: '', province: '', city: '' })
  const cities = useMemo(() => form.province ? regions[form.province] || [] : [], [form.province])
  const [sessionToken, setSessionToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'province' ? { city: '' } : {}) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new URLSearchParams()
      if (isAnonymous) {
        fd.append('name', 'Anonim')
        fd.append('email', '')
        fd.append('phone', '')
        fd.append('institution', '')
        fd.append('province', '')
        fd.append('city', '')
      } else {
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      }
      fd.append('avatar', avatar.id)
      fd.append('session_token', sessionToken)
      fd.append('authorization', localStorage.getItem('token') || '')
      const { data } = await startSurvey(fd)
      navigate(`/survey?session=${data.session_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memulai survey')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-bg to-primary text-white font-sans antialiased">
      <nav className="w-full bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed text-3xl">security</span>
            <span className="text-lg font-semibold tracking-tight">SadarSiber.ID</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#beranda" className="hover:text-primary-fixed transition-colors">Beranda</a>
            <a href="#statistik" className="hover:text-primary-fixed transition-colors">Statistik</a>
            <a href="#fitur" className="hover:text-primary-fixed transition-colors">Fitur</a>
            {user && <Link to="/dashboard" className="hover:text-primary-fixed transition-colors">Dashboard</Link>}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm hidden md:inline">{user.name}</span>
                <button onClick={() => { logout(); navigate('/') }}
                  className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Keluar</button>
              </div>
            ) : (
              <Link to="/login"
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/30">
                Mulai Tes
              </Link>
            )}
          </div>
        </div>
      </nav>

      <header className="pt-6 pb-10 md:pt-10 md:pb-16 px-6 max-w-6xl mx-auto" id="beranda">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Seberapa Tangguh <span className="text-blue-200">Tameng Digital</span> Anda?
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl">
              Ikuti asesmen interaktif untuk mengukur kesiapan Anda dalam menghadapi ancaman rekayasa sosial dan banjir konten negatif di era digital. Cek skor kesadaran siber Anda sekarang, gratis di SadarSiber.ID!
            </p>
            <div className="flex items-center gap-6 text-sm text-blue-100">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-blue-200 text-base">lock</span> Data Terenkripsi</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-blue-200 text-base">speed</span> Cepat & Mudah</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-blue-200 text-base">shield</span> Anonim</span>
            </div>
          </div>

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-gray-900">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-primary mb-3">
                <span className="material-symbols-outlined">play_arrow</span>
              </div>
              <h3 className="text-lg font-semibold">Mulai Test</h3>
              <p className="text-sm text-gray-500 mt-1">Ikuti asesmen kesadaran digital sekarang</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ring-2 ring-offset-2 ring-primary/20 transition-all"
                    style={{ backgroundColor: avatar.bg }}>
                    <span role="img" aria-label={avatar.label}>{avatar.emoji}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setAvatar(AVATARS[(AVATARS.indexOf(avatar) - 1 + AVATARS.length) % AVATARS.length])}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                        <span className="material-symbols-outlined text-base">chevron_left</span>
                      </button>
                      <span className="text-xs font-medium text-gray-500 min-w-[44px] text-center">{avatar.label}</span>
                      <button type="button" onClick={() => setAvatar(AVATARS[(AVATARS.indexOf(avatar) + 1) % AVATARS.length])}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </button>
                    </div>
                    <button type="button" onClick={() => setAvatar(getRandomAvatar())}
                      className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">shuffle</span> acak
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                  <button type="button" onClick={() => setIsAnonymous(false)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${!isAnonymous ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    <span className="material-symbols-outlined text-xs align-text-bottom mr-0.5">person</span> Biodata
                  </button>
                  <button type="button" onClick={() => setIsAnonymous(true)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${isAnonymous ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    <span className="material-symbols-outlined text-xs align-text-bottom mr-0.5">visibility_off</span> Anonim
                  </button>
                </div>
              </div>

              {isAnonymous ? (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-3 border border-purple-100/50">
                  <div className="flex items-center gap-2 text-xs text-purple-600">
                    <span className="material-symbols-outlined text-sm">check_shield</span>
                    <span>Mode Anonim — nama akan tercatat sebagai <strong>"Anonim"</strong></span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-lg">person</span>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-gray-300"
                      placeholder="Nama lengkap" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-lg">mail</span>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-gray-300"
                        placeholder="Email" />
                    </div>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-lg">phone</span>
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-gray-300"
                        placeholder="No. HP" />
                    </div>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-lg">business</span>
                    <input name="institution" value={form.institution} onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all placeholder:text-gray-300"
                      placeholder="Institusi / Organisasi" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-lg">map</span>
                      <select name="province" value={form.province} onChange={handleChange}
                        className="w-full pl-9 pr-7 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all appearance-none text-gray-500">
                        <option value="">Provinsi</option>
                        {Object.keys(regions).sort().map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-lg">expand_more</span>
                    </div>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors text-lg">location_city</span>
                      <select name="city" value={form.city} onChange={handleChange}
                        className="w-full pl-9 pr-7 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all appearance-none text-gray-500">
                        <option value="">Kota</option>
                        {cities.sort().map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-lg">expand_more</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" checked={showToken} onChange={(e) => setShowToken(e.target.checked)} className="sr-only" />
                    <div className={`w-8 h-5 rounded-full transition-colors ${showToken ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${showToken ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">vpn_key</span> Token
                  </span>
                </label>
                {showToken && (
                  <div className="flex-1 max-w-[180px]">
                    <input type="text" value={sessionToken} onChange={(e) => setSessionToken(e.target.value.toUpperCase())} required
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none text-xs text-center uppercase tracking-widest font-mono placeholder:text-gray-300 transition-all"
                      placeholder="AB12CD34" maxLength={8} />
                  </div>
                )}
              </div>
              {showToken && (
                <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-xs mt-0.5">info</span>
                  Token digunakan jika survey ini adalah bagian dari sesi/kelompok tertentu yang dibuat oleh penyelenggara. Masukkan token yang diberikan panitia untuk mengaitkan hasil Anda dengan sesi tersebut.
                </p>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed border border-blue-100">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5">verified</span>
                  <div>
                    <p className="font-medium mb-0.5">Data Anda aman & terjaga kerahasiaannya</p>
                    <p>Informasi yang Anda berikan hanya digunakan untuk keperluan asesmen dan tidak akan dibagikan kepada pihak ketiga. Hasil penilaian bersifat anonim dan agregat.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <span className="material-symbols-outlined text-amber-600 text-base">schedule</span>
                <span className="text-xs text-amber-700">±5–7 menit · 20 pertanyaan pilihan ganda</span>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Memulai...</>
                ) : (
                  <><span className="material-symbols-outlined text-base">play_arrow</span> Mulai Test</>
                )}
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="py-16 bg-white/5 backdrop-blur-sm border-y border-white/10" id="statistik">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'groups', value: stats ? stats.total_respondents.toLocaleString() : '...', label: 'Responden Terdaftar' },
              { icon: 'analytics', value: stats ? stats.total_sessions?.toLocaleString() || '0' : '...', label: 'Sesi Aktif' },
              { icon: 'verified', value: stats ? stats.average_score + '%' : '...', label: 'Skor Rata-rata' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-6 text-center border border-white/5 backdrop-blur-md">
                <span className="material-symbols-outlined text-primary-fixed text-4xl mb-4">{s.icon}</span>
                <div className="text-4xl font-bold mb-2">{s.value}</div>
                <p className="text-blue-100 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-6xl mx-auto" id="fitur">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Fokus Asesmen Utama</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Modul evaluasi yang dirancang khusus untuk mengidentifikasi celah keamanan manusia.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white text-3xl">phishing</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Social Engineering</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Evaluasi kerentanan terhadap taktik rekayasa sosial seperti phishing, pretexting, dan manipulasi psikologis.</p>
            <ul className="space-y-3">
              {['Simulasi Phishing Email', 'Identifikasi Penipuan (Scam)', 'Keamanan Kata Sandi'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                  <span className="material-symbols-outlined text-success-emerald text-lg">check_circle</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-14 h-14 bg-secondary-container rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-on-secondary-container text-3xl">gpp_bad</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Konten Negatif</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Ukur kemampuan membedakan informasi valid dan mengidentifikasi misinformasi, hoaks, serta konten berbahaya.</p>
            <ul className="space-y-3">
              {['Deteksi Berita Palsu (Hoaks)', 'Keamanan Browsing', 'Etika Media Sosial'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 text-sm">
                  <span className="material-symbols-outlined text-success-emerald text-lg">check_circle</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="bg-slate-bg/50 border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed">security</span>
            <span className="font-semibold text-white">SadarSiber.ID</span>
          </div>
          <p>© 2026 SadarSiber.ID / Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}
