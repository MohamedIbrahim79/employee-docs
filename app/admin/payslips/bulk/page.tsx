'use client'
import { useState } from 'react'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

export default function BulkPayslips() {
  const [files, setFiles] = useState<File[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [results, setResults] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  function getToken() {
    return localStorage.getItem('auth_token') || ''
  }

  function parsePersonalNr(filename: string): string | null {
    // اسم الملف مثلاً: 01071_202510_Abrechnung...
    const match = filename.match(/^(\d+)_/)
    return match ? match[1] : null
  }

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    setResults([])

    const token = getToken()
    const newResults: any[] = []

    for (const file of files) {
      const personalNr = parsePersonalNr(file.name)

      if (!personalNr) {
        newResults.push({ file: file.name, status: 'error', msg: 'Personal-Nr. nicht erkannt' })
        continue
      }

      // ابحث عن الموظف بالـ personal_nr
      const empRes = await fetch(`/api/employees/by-personal-nr?personal_nr=${personalNr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const emp = await empRes.json()

      if (!emp?.id) {
        newResults.push({ file: file.name, status: 'error', msg: `Kein Mitarbeiter mit Personal-Nr. ${personalNr} gefunden` })
        continue
      }

      const fd = new FormData()
      fd.append('file', file)
      fd.append('user_id', emp.id)
      fd.append('month', month.toString())
      fd.append('year', year.toString())

      const res = await fetch('/api/payslips', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      })

      if (res.ok) {
        newResults.push({ file: file.name, status: 'success', msg: `✅ ${emp.full_name}` })
      } else {
        const data = await res.json()
        newResults.push({ file: file.name, status: 'error', msg: data.error || 'Fehler' })
      }

      setResults([...newResults])
    }

    setUploading(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="page-title mb-2">Massenupload Lohnabrechnungen</h1>
      <p className="text-gray-500 text-sm mb-6">
        Laden Sie mehrere Lohnabrechnungen gleichzeitig hoch. Der Dateiname muss mit der Personal-Nr. beginnen (z.B. <code className="bg-gray-100 px-1 rounded">01071_202510_...</code>)
      </p>

      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-brand-900/5">
          <h2 className="font-semibold text-brand-900">Dateien auswählen</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monat</label>
              <select className="input" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Jahr</label>
              <select className="input" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">PDF-Dateien (mehrere auswählen)</label>
            <input
              type="file"
              accept=".pdf"
              multiple
              className="input"
              onChange={e => setFiles(Array.from(e.target.files || []))}
            />
            {files.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{files.length} Datei(en) ausgewählt</p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !files.length}
            className="btn-primary">
            {uploading ? 'Wird hochgeladen...' : `${files.length} Datei(en) hochladen`}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-brand-900/5">
            <h2 className="font-semibold text-brand-900">Ergebnisse</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((r, i) => (
              <div key={i} className={`p-4 flex items-center gap-3 ${r.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                <span>{r.status === 'success' ? '✅' : '❌'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.file}</p>
                  <p className="text-xs text-gray-600">{r.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}