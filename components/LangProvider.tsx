'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, tr, t } from '@/lib/translations'

type LangContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof t) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'de',
  setLang: () => {},
  t: (key) => key as string,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved === 'ar' || saved === 'de') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t: (key) => tr(key, lang) }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
