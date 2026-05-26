'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  doc: any
  userId: string
  onClose: () => void
  onDone: () => void
}

const ISSUE_DATE_ONLY_DOCS = ['Führungszeugnis']
const NO_DATES_DOCS = ['Steuer-ID', 'Sozialversicherungsnummer', 'Bewacher_ID']
const BANK_DOC = 'Bankkarte / IBAN'
const BEWACHER_ID_DOC = 'Bewacher_ID'

export default function UploadModal({ doc, userId, onClose, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [expiryDate, setExpiryDate] = useState(doc.expiry_date || '')
  const [issueDate, setIssueDate] = useState(doc.issue_date || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMsg, setAiMsg] = useState('')

  const [bankMode, setBankMode] = useState<'card' | 'iban'>('card')
  const [iban, setIban] = useState('')
  const [bic, setBic] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [ibanExpiry, setIbanExpiry] = useState('')
  const [bewacherId, setBewacherId] = useState('')

  const docNameDe = doc.document_type?.name_de || ''
  const isIssueDateOnly = ISSUE_DATE_ONLY_DOCS.includes(docNameDe)
  const isNoDates = NO_DATES_DOCS.includes(docNameDe)
  const isBankDoc = docNameDe === BANK_DOC
  const isBewacherDoc = docNameDe === BEWACHER_ID_DOC
  const showExpiryDate = doc.document_type?.has_expiry && !isIssueDateOnly && !isNoDates && !isBankDoc

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setAiMsg('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => setError('Datei nicht akzeptiert. Nur Bilder oder PDF bis 10MB erlaubt.'),
  })

  async function extractWithAI() {
    if (!file) { setError('Bitte zuerst eine Datei hochladen'); return }
    setAiLoading(true); setAiMsg(''); setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('doc_type', docNameDe)

    const res = await fetch('/api/ai-extract', { method: 'POST', body: fd })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'AI Fehler'); setAiLoading(false); return }

    let found = false
    if (data.expiry_date) {
      setExpiryDate(data.expiry_date)
      setIbanExpiry(data.expiry_date.substring(0, 7))
      found = true
    }
    if (data.issue_date) { setIssueDate(data.issue_date); found = true }

    setAiMsg(found ? '✅ Daten erfolgreich erkannt!' : '⚠️ Keine Daten gefunden – bitte manuell eingeben')
    setAiLoading(false)
  }

  async function handleUpload() {
    const token = localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''

    if (isBewacherDoc) {
      if (!bewacherId.trim()) { setError('Bitte Bewacher-ID eingeben'); return }
      setUploading(true); setError(''); setProgress(50)
      const fd = new FormData()
      fd.append('document_type_id', doc.document_type?.id)
      fd.append('user_id', userId)
      fd.append('bewacher_id', bewacherId)
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      })
      const data = await res.json()
      setProgress(100)
      if (!res.ok) { setError(data.error || 'Fehler'); setUploading(false); return }
      onDone()
      return
    }

    if (isBankDoc && bankMode === 'iban') {
      if (!iban) { setError('Bitte IBAN eingeben'); return }
      if (!ibanExpiry) { setError('Bitte Ablaufdatum eingeben'); return }
      setUploading(true); setError(''); setProgress(50)
      const fd = new FormData()
      fd.append('document_type_id', doc.document_type?.id)
      fd.append('user_id', userId)
      fd.append('expiry_date', ibanExpiry + '-01')
      fd.append('iban', iban)
      fd.append('bic', bic)
      fd.append('bank_name', bankName)
      fd.append('account_holder', accountHolder)
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      })
      const data = await res.json()
      setProgress(100)
      if (!res.ok) { setError(data.error || 'Upload fehlgeschlagen'); setUploading(false); return }
      onDone()
      return
    }

    if (!file && !doc.file_url) { setError('Bitte laden Sie eine Datei hoch'); return }
    if (showExpiryDate && !expiryDate) { setError('Bitte Ablaufdatum eingeben'); return }
    if (isIssueDateOnly && !issueDate) { setError('Bitte Ausstellungsdatum eingeben'); return }
    if (isBankDoc && !expiryDate) { setError('Bitte Ablaufdatum eingeben'); return }

    let finalExpiryDate = expiryDate
    if (isIssueDateOnly && issueDate) {
      const issue = new Date(issueDate)
      issue.setMonth(issue.getMonth() + 6)
      finalExpiryDate = issue.toISOString().split('T')[0]
    }

    setUploading(true); setError(''); setProgress(30)

    try {
      const fd = new FormData()
      if (file) fd.append('file', file)
      fd.append('document_type_id', doc.document_type?.id)
      fd.append('user_id', userId)
      if (finalExpiryDate) fd.append('expiry_date', finalExpiryDate)
      if (issueDate) fd.append('issue_date', issueDate)

      setProgress(60)
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      })
      const data = await res.json()
      setProgress(100)
      if (!res.ok) { setError(data.error || 'Upload fehlgeschlagen'); setUploading(false); return }
      onDone()
    } catch {
      setError('Verbindungsfehler')
      setUploading(false)
    }
  }

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{docNameDe}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {isBewacherDoc && (
            <div>
              <label className="label">Bewacher-ID Nummer <span className="text-red-500">*</span></label>
              <input className="input font-mono" value={bewacherId} onChange={e => setBewacherId(e.target.value)} placeholder="z.B. 123456789" />
              <p className="text-xs text-gray-400 mt-1">Geben Sie Ihre Bewacher-Identifikationsnummer ein</p>
            </div>
          )}

          {isBankDoc && (
            <div className="flex gap-2">
              <button onClick={() => setBankMode('card')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${bankMode === 'card' ? 'bg-brand-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Bankkarte hochladen
              </button>
              <button onClick={() => setBankMode('iban')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${bankMode === 'iban' ? 'bg-brand-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                IBAN eingeben
              </button>
            </div>
          )}

          {isBankDoc && bankMode === 'iban' ? (
            <div className="space-y-4">
              <div>
                <label className="label">Kontoinhaber <span className="text-red-500">*</span></label>
                <input className="input" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="Max Mustermann" />
              </div>
              <div>
                <label className="label">IBAN <span className="text-red-500">*</span></label>
                <input className="input font-mono" value={iban} onChange={e => setIban(e.target.value.toUpperCase())} placeholder="DE00 0000 0000 0000 0000 00" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">BIC</label>
                  <input className="input font-mono" value={bic} onChange={e => setBic(e.target.value.toUpperCase())} placeholder="XXXXXXXX" />
                </div>
                <div>
                  <label className="label">Bank</label>
                  <input className="input" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Sparkasse..." />
                </div>
              </div>
              <div>
                <label className="label">Ablaufdatum <span className="text-red-500">*</span></label>
                <input type="month" className="input" value={ibanExpiry} onChange={e => setIbanExpiry(e.target.value)} />
              </div>
            </div>
          ) : !isBewacherDoc && (
            <>
              <div>
                <label className="label">Datei (Foto oder PDF)</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-brand-500 bg-brand-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                  }`}>
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <p className="font-medium text-green-700 text-sm">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{fileSizeMB} MB</p>
                      <p className="text-xs text-brand-600 mt-2">Klicken zum Ändern</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-600 text-sm">Datei hier ablegen oder klicken</p>
                      <p className="text-xs text-gray-400 mt-1">JPG · PNG · PDF · max. 10MB</p>
                    </div>
                  )}
                </div>

                {/* AI Button */}
                {file && !isNoDates && (
                  <button
                    onClick={extractWithAI}
                    disabled={aiLoading}
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #1a2744, #2d3f6b)', color: 'white' }}>
                    {aiLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        KI liest das Dokument...
                      </>
                    ) : (
                      <>✨ Daten automatisch erkennen (KI)</>
                    )}
                  </button>
                )}

                {aiMsg && (
                  <p className={`text-sm mt-2 px-3 py-2 rounded-lg ${aiMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {aiMsg}
                  </p>
                )}
              </div>

              {isBankDoc && (
                <div>
                  <label className="label">Ablaufdatum <span className="text-red-500">*</span></label>
                  <input type="month" className="input"
                    value={expiryDate ? expiryDate.substring(0, 7) : ''}
                    onChange={e => setExpiryDate(e.target.value + '-01')} />
                </div>
              )}

              {showExpiryDate && (
                <div>
                  <label className="label">Ablaufdatum <span className="text-red-500">*</span></label>
                  <input type="date" className="input" value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} />
                </div>
              )}

              {isIssueDateOnly && (
                <div>
                  <label className="label">Ausstellungsdatum <span className="text-red-500">*</span></label>
                  <input type="date" className="input" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Gültigkeitsdauer: 6 Monate ab Ausstellungsdatum</p>
                </div>
              )}
            </>
          )}

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          {uploading && progress > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Wird gespeichert...</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-brand-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Abbrechen</button>
          <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1 justify-center">
            {uploading ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}