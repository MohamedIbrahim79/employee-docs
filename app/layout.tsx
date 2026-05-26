import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/components/LangProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Schmeuser Security GmbH',
  description: 'Verwaltung von Mitarbeiterdokumenten und automatischen Benachrichtigungen',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231a2744' rx='8'/><polygon points='20,4 36,32 4,32' fill='%23c9a84c' opacity='0.9'/><polygon points='20,10 32,32 8,32' fill='%231a2744'/><polygon points='20,16 28,32 12,32' fill='%23c9a84c' opacity='0.6'/></svg>",
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" dir="ltr">
      <head>
        <meta name="theme-color" content="#0f1a2e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  )
}