import LenisProvider from '@/components/public/LenisProvider'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { gqlRequest } from '@/lib/graphql/client'
import { SETTINGS_QUERY } from '@/lib/graphql/queries'
import type { SiteSettings } from '@/lib/types'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let footerBigName = 'KYLIAN ROGER'
  let copyrightText = '© 2026 KYLIAN ROGER'

  try {
    const data = await gqlRequest<{ settings: SiteSettings }>(SETTINGS_QUERY)
    if (data.settings) {
      footerBigName = data.settings.footer_big_name || footerBigName
      copyrightText = data.settings.copyright_text || copyrightText
    }
  } catch {
    // fallback to defaults
  }

  return (
    <LenisProvider>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">{children}</main>
        <Footer
          bigName={footerBigName}
          copyright={copyrightText}
        />
      </div>
    </LenisProvider>
  )
}
