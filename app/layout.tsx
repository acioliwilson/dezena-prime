import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dezena Prime - Resultados de Loterias em Tempo Real | Mega-Sena, Lotofácil, Quina',
  description: 'Acesse os resultados da loteria em tempo real: Mega-Sena, Quina, Lotofácil e outras. No Dezena Prime, você encontra estatísticas detalhadas, últimos concursos e números sorteados com facilidade.',
  generator: 'wil.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
