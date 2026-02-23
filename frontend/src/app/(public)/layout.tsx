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
  let copyrightText = '© 2026 KYLIAN ROGER'
  let navbarLogoUrl = ''
  let footerLogoUrl = ''
  let navMenuOrder: string[] = ['home', 'works', 'contact']
  let navDropdownOrder: string[] = ['photography', 'film-motion', 'art-direction']

  try {
    const data = await gqlRequest<{ settings: SiteSettings }>(SETTINGS_QUERY)
    if (data.settings) {
      copyrightText = data.settings.copyright_text || copyrightText
      navbarLogoUrl = data.settings.navbar_logo_url || ''
      footerLogoUrl = data.settings.footer_logo_url || ''
      if (Array.isArray(data.settings.nav_menu_order) && data.settings.nav_menu_order.length > 0) {
        navMenuOrder = data.settings.nav_menu_order
      }
      if (Array.isArray(data.settings.nav_dropdown_order) && data.settings.nav_dropdown_order.length > 0) {
        navDropdownOrder = data.settings.nav_dropdown_order
      }
    }
  } catch {
    // fallback to defaults
  }

  return (
    <LenisProvider>
      <div className="page-wrapper">
        <Navbar
          logoUrl={navbarLogoUrl}
          menuOrder={navMenuOrder}
          dropdownOrder={navDropdownOrder}
        />
        <main className="main-wrapper">{children}</main>
        <Footer
          copyright={copyrightText}
          footerLogoUrl={footerLogoUrl}
          menuOrder={navMenuOrder}
          dropdownOrder={navDropdownOrder}
        />
      </div>
    </LenisProvider>
  )
}
