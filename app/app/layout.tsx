import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { AuthGuard } from './components/AuthGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Myth.OS',
  description: 'A one-page application with DaisyUI and TailwindCSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
          <AuthGuard>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}