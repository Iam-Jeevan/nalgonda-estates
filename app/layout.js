import './globals.css'
import { Providers } from './providers'
import { LanguageProvider } from '@/lib/LanguageContext'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Nalgonda Estates \u2014 Premium Land, Plots & Homes',
  description: 'Hyper-local real estate listings in and around Nalgonda. Browse agriculture land, plots and houses. Available in English, Telugu and Hindi.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-center" />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  )
}
