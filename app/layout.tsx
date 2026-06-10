import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#EAF4FF',
}

export const metadata: Metadata = {
  title: '우주 수학 탐험대',
  description: '7세~초등 6학년을 위한 우주 수학 게임',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '수학 탐험대',
  },
  icons: {
    apple: [{ url:'/icons/apple-icon-180.png', sizes:'180x180', type:'image/png' }],
    icon: [
      { url:'/icons/icon-192.png', sizes:'192x192', type:'image/png' },
      { url:'/icons/icon-512.png', sizes:'512x512', type:'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="수학 탐험대" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen w-full max-w-2xl mx-auto">
        {children}
      </body>
    </html>
  )
}
