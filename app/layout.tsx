import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/components/LangProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Mitarbeiter-Dokumentenverwaltung',
  description: 'Verwaltung von Mitarbeiterdokumenten und automatischen Benachrichtigungen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" dir="rtl">
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
