import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '우주 수학 탐험대',
  description: '7세~초등 6학년을 위한 우주 수학 게임',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#EAF4FF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen max-w-lg mx-auto">
        {children}
      </body>
    </html>
  )
}
