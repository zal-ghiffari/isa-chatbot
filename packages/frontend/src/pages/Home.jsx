import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { startSurvey } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import regions from '../data/regions'

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
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
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
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

      <header className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 max-w-6xl mx-auto" id="beranda">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Ukur & Tingkatkan <span className="text-blue-200">Kesadaran Keamanan Siber</span> Organisasi Anda
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl">
              SadarSiber.ID menyediakan platform asesmen komprehensif untuk mengukur tingkat kesadaran terhadap ancaman rekayasa sosial dan konten negatif.
            </p>
            <div className="flex items-center gap-6 text-sm text-blue-100">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-blue-200 text-base">lock</span> Data Terenkripsi</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-blue-200 text-base">speed</span> Cepat & Mudah</span>
            </div>
          </div>

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-gray-900">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-primary mb-3">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <h3 className="text-lg font-semibold">Registrasi Peserta</h3>
              <p className="text-sm text-gray-500 mt-1">Lengkapi data diri Anda di bawah ini</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none"
                    placeholder="Budi Santoso" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none"
                      placeholder="email@instansi.go.id" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">phone</span>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none"
                      placeholder="08xxxxxxxxxx" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instansi/OPD</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">business</span>
                  <input name="institution" value={form.institution} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none"
                    placeholder="Nama instansi" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">map</span>
                    <select name="province" value={form.province} onChange={handleChange}
                      className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none appearance-none">
                      <option value="">Pilih provinsi</option>
                      {Object.keys(regions).sort().map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota/Kab</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">location_city</span>
                    <select name="city" value={form.city} onChange={handleChange}
                      className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm outline-none appearance-none">
                      <option value="">Pilih kota</option>
                      {cities.sort().map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              {sessionToken && (
                <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">vpn_key</span>
                  Token sesi: <strong className="font-mono">{sessionToken}</strong>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-600 leading-relaxed">
                ⏱ ±5–7 menit · 20 pertanyaan. <strong>Data Anda aman & anonim.</strong>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Memulai...' : 'Daftar Sekarang'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">Punya token sesi? Masukkan di sini</p>
              <input type="text" value={sessionToken} onChange={(e) => setSessionToken(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm text-center uppercase tracking-widest font-mono"
                placeholder="CONTOH: AB12CD34" maxLength={8} />
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 bg-white/5 backdrop-blur-sm border-y border-white/10" id="statistik">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'groups', value: '12,405+', label: 'Responden Terdaftar' },
              { icon: 'analytics', value: '142', label: 'Sesi Aktif' },
              { icon: 'verified', value: '86%', label: 'Skor Rata-rata' },
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
          <p>© 2024 SadarSiber.ID. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}
