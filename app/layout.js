import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'YouthAI OS — Sistemul AI pentru ecosistemul tinerilor',
  description: 'Spații de lucru, agenți AI, granturi, prezentări, documente și oportunități pentru organizațiile de tineret și ONG-uri. Bazat pe Azure OpenAI.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
