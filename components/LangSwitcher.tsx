'use client'
import { useLang } from './LangProvider'

export default function LangSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <button
      onClick={() => setLang(lang === 'de' ? 'ar' : 'de')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium text-gray-600"
      title={lang === 'de' ? 'Auf Arabisch wechseln' : 'التغيير للألمانية'}
    >
      {lang === 'de' ? (
        <><span className="text-base">🇩🇪</span> DE → عربي</>
      ) : (
        <><span className="text-base">🇸🇦</span> عربي → DE</>
      )}
    </button>
  )
}
