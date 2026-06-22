import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CareerAI — AI-Powered Career Assistant',
    template: '%s | CareerAI',
  },
  description:
    'Build ATS-friendly resumes, ace interviews, and land your dream job — all powered by AI. Free 7-day trial.',
  keywords: [
    'ATS resume builder',
    'AI resume optimizer',
    'free resume builder India',
    'ATS score checker',
    'cover letter generator',
    'interview coach AI',
    'job tracker',
  ],
  authors: [{ name: 'CareerAI' }],
  creator: 'CareerAI',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'CareerAI — AI-Powered Career Assistant',
    description:
      'From resume to offer letter — AI-powered, every step of the way.',
    siteName: 'CareerAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerAI — AI-Powered Career Assistant',
    description: 'Build ATS-friendly resumes and land your dream job.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0A0A0F] text-slate-100 min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A26',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F1F5F9',
            },
          }}
        />
      </body>
    </html>
  )
}
