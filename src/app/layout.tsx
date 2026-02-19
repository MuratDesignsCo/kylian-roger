import type { Metadata } from 'next'
import '@/styles/normalize.css'
import '@/styles/utilities.css'
import '@/styles/styles.css'

export const metadata: Metadata = {
  title: 'Kylian Roger — Photographe, Réalisateur & Directeur Artistique',
  description:
    'Portfolio de Kylian Roger, artiste multidisciplinaire. Photographie, réalisation et direction artistique pour l\'automobile, le sport, le lifestyle et des projets éditoriaux.',
  icons: {
    icon: '/images/favicon.ico',
    apple: '/images/webclip.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr-FR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
