'use client'

import React, { useState } from 'react'

export const PaginatedReport: React.FC<{ report: any[] }> = ({ report }) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [search, setSearch] = useState('')

  if (!Array.isArray(report) || report.length === 0) {
    return (
      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fafafa', fontSize: '13px' }}>
        <em>Belum ada log per-baris pada run ini.</em>
      </div>
    )
  }

  // Filter
  const filtered = report.filter((item) => {
    if (filterAction !== 'all' && item.action !== filterAction) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchSlug = item.slug?.toLowerCase().includes(q)
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchKey = item.key?.toLowerCase().includes(q)
      if (!matchSlug && !matchTitle && !matchKey) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * pageSize
  const paginatedItems = filtered.slice(startIdx, startIdx + pageSize)

  return (
    <div style={{ border: '2px solid #121212', background: '#fff', padding: '16px', marginTop: '10px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>Filter:</span>
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value)
              setPage(1)
            }}
            style={{ padding: '4px 8px', border: '1px solid #121212', fontSize: '12px', fontWeight: 'bold' }}
          >
            <option value="all">Semua Status ({report.length})</option>
            <option value="created">Dibuat ({report.filter((r) => r.action === 'created').length})</option>
            <option value="updated">Diupdate ({report.filter((r) => r.action === 'updated').length})</option>
            <option value="skipped">Dilewati ({report.filter((r) => r.action === 'skipped').length})</option>
            <option value="dry-run">Dry Run ({report.filter((r) => r.action === 'dry-run').length})</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cari slug / judul..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{ padding: '4px 8px', border: '1px solid #121212', fontSize: '12px', width: '180px' }}
          />
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            style={{ padding: '4px 8px', border: '1px solid #121212', fontSize: '12px' }}
          >
            <option value={10}>10 / hal</option>
            <option value={15}>15 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #121212' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#121212', color: '#fff', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 10px' }}>No</th>
              <th style={{ padding: '8px 10px' }}>Action</th>
              <th style={{ padding: '8px 10px' }}>Slug / Key</th>
              <th style={{ padding: '8px 10px' }}>Judul Dokumen</th>
              <th style={{ padding: '8px 10px' }}>Status QA</th>
              <th style={{ padding: '8px 10px' }}>Issues / Error</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                  Tidak ada baris yang sesuai filter.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, idx) => {
                const globalIdx = startIdx + idx + 1
                const isError = item.severity === 'blocked' || item.action === 'skipped'
                const actionBg =
                  item.action === 'created'
                    ? '#d4edda'
                    : item.action === 'updated'
                      ? '#d1ecf1'
                      : item.action === 'skipped'
                        ? '#fff3cd'
                        : '#e2e3e5'
                const actionColor =
                  item.action === 'created'
                    ? '#155724'
                    : item.action === 'updated'
                      ? '#0c5460'
                      : item.action === 'skipped'
                        ? '#856404'
                        : '#383d41'

                return (
                  <tr
                    key={item.key || idx}
                    style={{
                      borderBottom: '1px solid #ddd',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{globalIdx}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          background: actionBg,
                          color: actionColor,
                        }}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: '11px' }}>
                      {item.slug || item.key}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: '240px', wordBreak: 'break-word' }}>
                      {item.title || '-'}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: item.severity === 'blocked' ? '#D02020' : item.severity === 'warning' ? '#F0C020' : '#155724',
                        }}
                      >
                        {item.severity || 'ok'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '11px', color: isError ? '#D02020' : '#666' }}>
                      {Array.isArray(item.issues) && item.issues.length > 0 ? (
                        item.issues.map((iss: any, i: number) => (
                          <div key={i}>
                            • [{iss.code}] {iss.message}
                          </div>
                        ))
                      ) : (
                        <em>Tidak ada issue</em>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Menampilkan {filtered.length === 0 ? 0 : startIdx + 1} - {Math.min(startIdx + pageSize, filtered.length)} dari {filtered.length} entri
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '4px 10px',
              border: '1px solid #121212',
              background: currentPage <= 1 ? '#eee' : '#fff',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
          >
            &laquo; Prev
          </button>
          <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: '4px 10px',
              border: '1px solid #121212',
              background: currentPage >= totalPages ? '#eee' : '#fff',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaginatedReport
