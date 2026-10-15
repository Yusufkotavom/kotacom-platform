'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export const RunProgramButton: React.FC = () => {
  const { id } = useDocumentInfo()

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedScope, setSelectedScope] = useState<'all' | 'failed_only' | 'new_only'>('all')

  if (!id) {
    return (
      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fafafa', fontSize: '13px' }}>
        <em>Simpan program terlebih dahulu untuk menjalankan generator.</em>
      </div>
    )
  }

  // 1. Eksekusi Generator (Full / Overwrite / Skip)
  const handleRun = async (opts: {
    isSample?: boolean
    maxRows?: number
    scope?: 'all' | 'failed_only' | 'new_only'
    writeMode: 'create' | 'overwrite'
  }) => {
    const isSample = opts.isSample ?? false
    const targetWriteMode = opts.writeMode
    const runScope = opts.scope ?? selectedScope

    const confirmMsg = isSample
      ? 'Jalankan 1 sampel baris pertama untuk uji coba? Dokumen sampel akan dibuat/diupdate.'
      : targetWriteMode === 'overwrite'
        ? `PERINGATAN: Generator akan menimpa/overwrite dokumen yang ada (Scope: ${runScope}). Lanjutkan?`
        : `Generator akan dijalankan dalam mode create / skip existing (Scope: ${runScope}). Lanjutkan?`

    if (!window.confirm(confirmMsg)) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/generator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: id,
          mode: 'generate', // Selalu 'generate' agar bukan sekadar dry-run
          writeMode: targetWriteMode,
          maxRows: opts.maxRows,
          scope: runScope,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const total = data.totals || {}
      const sampleReport = Array.isArray(data.report) && data.report.length > 0 ? data.report[0] : null
      const sampleLink = sampleReport?.slug ? ` (Slug: /${sampleReport.slug})` : ''

      setResult(
        `Sukses! (${(data.durationMs / 1000).toFixed(1)}s, ${total.concurrency ?? 4} workers, scope: ${total.scope ?? runScope}). Total diproses: ${total.rows ?? 0} dari ${total.totalDatasetRows ?? total.rows ?? 0} baris (Dibuat: ${total.created ?? 0}, Diupdate: ${total.updated ?? 0}, Dilewati: ${total.skipped ?? 0}, Error: ${total.blocked ?? 0})${sampleLink}.`
      )
    } catch (err: any) {
      setError(err?.message || 'Gagal menjalankan generator')
    } finally {
      setLoading(false)
    }
  }

  // 2. Hapus Semua Dokumen Hasil Generator (Purge)
  const handlePurge = async () => {
    const input = window.prompt(
      'BAHAYA: Tindakan ini akan MENGHAPUS SEMUA dokumen (halaman/post) yang dihasilkan oleh generator ini.\n\nKetik "HAPUS" untuk konfirmasi:'
    )
    if (input !== 'HAPUS') {
      if (input !== null) alert('Konfirmasi tidak cocok. Pembatalan dilakukan.')
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/generator/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: id,
          confirm: true,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setResult(`Sukses! Berhasil menghapus ${data.deletedCount ?? 0} dokumen hasil generator ini.`)
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus dokumen generator')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px', padding: '16px', border: '2px solid #121212', background: '#f8f8f8', borderRadius: '0px', boxShadow: '4px 4px 0px #121212' }}>
      <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🚀 Actions Generator</span>
      </div>
      <p style={{ fontSize: '12px', color: '#555', marginBottom: '12px', lineHeight: '1.4' }}>
        Kelola eksekusi konten, uji coba sampel, atau bersihkan hasil generator program ini.
      </p>

      {/* Selector Scope */}
      <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>
          Target Scope (Incremental):
        </label>
        <select
          value={selectedScope}
          disabled={loading}
          onChange={(e) => setSelectedScope(e.target.value as any)}
          style={{
            padding: '6px 8px',
            border: '2px solid #121212',
            fontSize: '11px',
            fontWeight: 600,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="all">Semua Baris (Full Batch)</option>
          <option value="new_only">Hanya Baris Baru (Skip yg Sudah Ada)</option>
          <option value="failed_only">Ulangi yang Gagal / Error Saja</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Tombol Preview 1 Sample */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleRun({ writeMode: 'overwrite', maxRows: 1, isSample: true })}
          style={{
            padding: '8px 12px',
            backgroundColor: '#F0C020',
            color: '#121212',
            border: '2px solid #121212',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '11px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '2px 2px 0px #121212',
            opacity: loading ? 0.6 : 1,
            textAlign: 'center',
          }}
        >
          🔍 Preview / Run 1 Sample Saja
        </button>

        {/* Tombol Full Overwrite */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleRun({ writeMode: 'overwrite' })}
          style={{
            padding: '10px 14px',
            backgroundColor: '#D02020',
            color: '#fff',
            border: '2px solid #121212',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '2px 2px 0px #121212',
            opacity: loading ? 0.6 : 1,
            textAlign: 'center',
          }}
        >
          {loading ? 'Sedang Memproses...' : '⚡ Run & Overwrite Semua Baris'}
        </button>

        {/* Tombol Run Create Only */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleRun({ writeMode: 'create' })}
          style={{
            padding: '8px 12px',
            backgroundColor: '#1040C0',
            color: '#fff',
            border: '2px solid #121212',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '11px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '2px 2px 0px #121212',
            opacity: loading ? 0.6 : 1,
            textAlign: 'center',
          }}
        >
          {loading ? 'Sedang Memproses...' : '➕ Run (Skip Yang Sudah Ada)'}
        </button>

        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />

        {/* Tombol Delete Semua Hasil */}
        <button
          type="button"
          disabled={loading}
          onClick={handlePurge}
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            color: '#D02020',
            border: '2px solid #D02020',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontSize: '11px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '2px 2px 0px #D02020',
            opacity: loading ? 0.6 : 1,
            textAlign: 'center',
          }}
        >
          🗑️ Hapus Semua Hasil Dokumen
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#D02020', fontWeight: 'bold' }}>
          ⏳ Sedang memproses... Mohon tunggu sampai selesai.
        </div>
      )}

      {result && (
        <div style={{ marginTop: '12px', padding: '10px', background: '#e6fffa', border: '1px solid #38b2ac', color: '#234e52', fontSize: '12px', fontWeight: 'bold' }}>
          {result}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '12px', padding: '10px', background: '#fff5f5', border: '1px solid #e53e3e', color: '#9b2c2c', fontSize: '12px', fontWeight: 'bold' }}>
          ❌ {error}
        </div>
      )}
    </div>
  )
}

export default RunProgramButton
