import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createSession } from '../api/client'

export default function CreateSession() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) { navigate('/login'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const fd = new URLSearchParams()
      fd.append('title', title); fd.append('description', description)
      const { data } = await createSession(fd)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal membuat sesi')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Buat Sesi Survey</h1>
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span> Dashboard
          </Link>
        </div>

        {result ? (
          <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sesi Berhasil Dibuat!</h2>
            <p className="text-sm text-gray-500 mt-1">Bagikan token ini kepada peserta survey</p>

            <div className="mt-6 bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-2">Token Sesi</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold text-primary tracking-widest">{result.token}</span>
                <button onClick={() => navigator.clipboard.writeText(result.token)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-primary" title="Salin">
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>Judul: {result.title}</p>
                {result.description && <p>Deskripsi: {result.description}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={() => { setResult(null); setTitle(''); setDescription('') }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                Buat Lagi
              </button>
              <Link to={`/sessions/${result.token}/results`}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-90 transition">
                Lihat Hasil
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-5">Buat token sesi untuk mengumpulkan survey dari grup tertentu. Bagikan token ke peserta, dan lihat hasilnya secara agregat.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Sesi <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Contoh: Pelatihan Kominfo Batch 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Deskripsi singkat tentang sesi ini" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-90 transition-all disabled:opacity-60">
                {loading ? 'Membuat...' : 'Buat Sesi'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
