'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

export const RunProgramButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const { value: writeModeVal } = useField<string>({ path: 'writeMode' })
  const { value: aiModeVal } = useField<string>({ path: 'aiMode' })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!id) {
    return (
      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fafafa', fontSize: '13px' }}>
        <em>Simpan program terlebih dahulu untuk menjalankan generator.</em>
      </div>
    )
  }

  const handleRun = async (overrideWriteMode?: 'create' | 'overwrite') => {
    const targetWriteMode = overrideWriteMode || (writeModeVal as 'create' | 'overwrite') || 'overwrite'
    const confirmMsg =
      targetWriteMode === 'overwrite'
        ? 'PERINGATAN: Generator akan menimpa/overwrite dokumen yang sudah ada dengan konten/template terbaru. Lanjutkan?'
        : 'Generator akan dijalankan dalam mode create (dokumen yang sudah ada akan di-skip). Lanjutkan?'

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
          mode: aiModeVal || 'generate',
          writeMode: targetWriteMode,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const total = data.totals || {}
      setResult(
        `Sukses! Selesai dalam ${(data.durationMs / 1000).toFixed(1)}s. Total: ${total.rows ?? 0} baris (Dibuat: ${total.created ?? 0}, Diupdate: ${total.updated ?? 0}, Dilewati: ${total.skipped ?? 0}, Error: ${total.blocked ?? 0}).`
      )
    } catch (err: any) {
      setError(err?.message || 'Gagal menjalankan generator')
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
        Eksekusi generator untuk memproses baris dataset sesuai template. Dokumen yang dihasilkan akan otomatis diupdate bila memilih <strong>Overwrite</strong>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleRun('overwrite')}
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
          {loading ? 'Sedang Memproses...' : '⚡ Run & Overwrite (Update Konten)'}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleRun('create')}
          style={{
            padding: '8px 14px',
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
          {loading ? 'Sedang Memproses...' : '➕ Run (Skip Dokumen yang Ada)'}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#D02020', fontWeight: 'bold' }}>
          ⏳ Memproses generator... Mohon tunggu, AI sedang menyusun dokumen.
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
