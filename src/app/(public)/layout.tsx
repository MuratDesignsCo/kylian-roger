import LenisProvider from '@/components/public/LenisProvider'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabase()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('footer_big_name, copyright_text')
    .eq('id', 'global')
    .single()

  return (
    <LenisProvider>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">{children}</main>
        <Footer
          bigName={settings?.footer_big_name ?? 'KYLIAN ROGER'}
          copyright={settings?.copyright_text ?? '© 2026 KYLIAN ROGER'}
        />
      </div>
    </LenisProvider>
  )
}
