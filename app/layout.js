import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'YouthAI OS — The AI Operating System for the Youth Ecosystem',
  description: 'Workspaces, AI agents, grants, presentations, documents and opportunities for youth organizations and NGOs. Powered by Azure OpenAI.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
