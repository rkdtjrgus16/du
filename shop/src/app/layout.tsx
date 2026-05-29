import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '내 쇼핑몰',
  description: 'AI 탑재 개인 온라인 스토어',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
