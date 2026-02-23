'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearAuthSession } from '@/components/admin/AuthGuard'
import { LogOut, ChevronDown, FileText, FolderOpen, Settings } from 'lucide-react'

interface AuthSession {
  token: string
  user: { id: string; email: string }
}

interface AdminSidebarProps {
  session: AuthSession
}

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isPagesChild =
    pathname === '/admin/pages' ||
    pathname.startsWith('/admin/pages/') ||
    pathname.startsWith('/admin/homepage')

  const isWorksChild =
    pathname.startsWith('/admin/pages/photography') ||
    pathname.startsWith('/admin/pages/film-motion') ||
    pathname.startsWith('/admin/pages/art-direction')

  const [pagesOpen, setPagesOpen] = useState(true)
  const [worksOpen, setWorksOpen] = useState(isWorksChild)

  const handleLogout = () => {
    clearAuthSession()
    router.push('/admin/login')
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <aside className="w-72 shrink-0 bg-black">
      {/* Logo */}
      <div className="px-6 pb-8 pt-7">
        <Link
          href="/admin/pages"
          className="block transition-transform duration-200 hover:scale-[0.97] active:scale-[0.94]"
        >
          <svg viewBox="0 0 1273 65" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Kylian Roger" style={{ color: '#fff' }}>
            <path d="M111.32 3.97L56.52 30.65V31.1L114.04 60.04V62.75H69.82L26.59 41.05H25.14V62.75H0V1.26H25.14V22.42H26.59L70 1.26H111.33V3.97H111.32Z"/>
            <path d="M173.24 20.52L194.67 1.26H230.12V2.16L185.71 41.95V62.75H160.57V41.95L116.17 2.16V1.26H151.62L173.05 20.52H173.24Z"/>
            <path d="M261.76 42.32H327.51V62.76H236.62V1.26H261.76V42.32Z"/>
            <path d="M360.05 62.76H334.91V1.26H360.05V62.76Z"/>
            <path d="M524.43 29.66V62.76H499.29V1.26H519L584.02 34.36V1.26H609.16V62.76H589.54L524.43 29.66Z"/>
            <path d="M734.29 1.26C762.87 1.26 768.56 11.66 768.56 24.77C768.56 35.44 761.51 42.5 747.76 45.21V45.48C747.76 45.48 750.38 47.02 752.37 48.55L770.64 61.93V62.74H736.18L713.93 46.19H688.16V62.74H663.02V1.26H734.29ZM688.17 21.7V27.94H736.1C741.71 27.94 743.06 26.95 743.06 24.78C743.06 22.97 741.79 21.71 736.1 21.71H688.17V21.7Z"/>
            <path d="M794.39 8.68C803.34 3.61 818.99 0 840.69 0C862.39 0 878.13 3.62 887.17 8.68C895.4 13.29 899.65 19.71 899.65 32.01C899.65 44.31 895.4 50.73 887.17 55.34C878.12 60.4 862.48 64.02 840.69 64.02C818.9 64.02 803.34 60.4 794.39 55.34C785.89 50.73 781.82 44.31 781.82 32.01C781.82 19.71 785.98 13.29 794.39 8.68ZM813.29 40.87C817.99 42.68 829.3 43.58 840.69 43.58C852.08 43.58 863.39 42.67 868.18 40.87C872.25 39.24 874.15 36.71 874.15 32.01C874.15 27.31 872.16 24.78 868.18 23.24C863.39 21.34 852.17 20.44 840.69 20.44C829.21 20.44 817.99 21.34 813.29 23.24C809.31 24.78 807.32 27.31 807.32 32.01C807.32 36.71 809.31 39.24 813.29 40.87Z"/>
            <path d="M968.51 25.23H1023.09V57.24C1012.42 60.31 989.45 64.02 969.19 64.02C945.22 64.02 932.29 62.21 922.43 56.97C914.2 52.63 909.14 44.49 909.14 33.1C909.14 21.71 914.57 13.84 922.16 9.22C931.39 3.61 946.31 0 969.19 0C990.8 0 1011.15 2.53 1020.83 4.16L1018.21 22.34C1001.57 20.44 986.65 19.17 969.19 19.17C954.27 19.17 944.32 20.53 939.62 23.15C935.28 25.59 934.65 29.57 934.65 33.1C934.65 36.26 935.83 40.33 939.99 42.23C944.6 44.31 953.28 44.85 969.2 44.85C978.15 44.85 989.82 44.31 997.96 43.4V40.41H968.52V25.22L968.51 25.23Z"/>
            <path d="M1066.48 40.06V45.4H1145.07V62.76H1041.34V1.26H1145.07V18.62H1066.48V23.96H1140.91V40.06H1066.48Z"/>
            <path d="M1235.85 1.26C1264.43 1.26 1270.12 11.66 1270.12 24.77C1270.12 35.44 1263.07 42.5 1249.32 45.21V45.48C1249.32 45.48 1251.94 47.02 1253.93 48.55L1272.2 61.93V62.74H1237.74L1215.49 46.19H1189.72V62.74H1164.58V1.26H1235.85ZM1189.73 21.7V27.94H1237.66C1243.27 27.94 1244.62 26.95 1244.62 24.78C1244.62 22.97 1243.35 21.71 1237.66 21.71H1189.73V21.7Z"/>
            <path d="M439.39 1.26H420.76L367.04 61.67V62.76H397.79L429.8 25.41H430.53L462.54 62.76H493.29V61.67L439.39 1.26Z"/>
          </svg>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3">
        <ul className="space-y-0.5">
          {/* Pages (link + dropdown toggle) */}
          <li>
            <div
              className={`sidebar-dropdown flex items-center rounded-lg transition-colors ${
                isPagesChild ? 'active' : ''
              }`}
            >
              <Link
                href="/admin/pages"
                className="flex flex-1 items-center gap-2.5 rounded-l-lg px-3 py-2.5 text-sm font-medium"
              >
                <FileText className="h-4 w-4 shrink-0" />
                Pages
              </Link>
              <button
                type="button"
                onClick={() => setPagesOpen(!pagesOpen)}
                className="rounded-r-lg px-2 py-2.5"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    pagesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {pagesOpen && (
              <ul className="mt-1 ml-3 space-y-0.5 pl-3" style={{ borderLeft: '1px solid #27272a' }}>
                {/* Home */}
                <li>
                  <Link
                    href="/admin/pages/home"
                    className={`sidebar-sub block rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                      isActive('/admin/pages/home') ? 'active' : ''
                    }`}
                  >
                    Home
                  </Link>
                </li>

                {/* Works (sub-dropdown) */}
                <li>
                  <button
                    type="button"
                    onClick={() => setWorksOpen(!worksOpen)}
                    className={`sidebar-sub flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                      isWorksChild ? 'active' : ''
                    }`}
                  >
                    Works
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        worksOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {worksOpen && (
                    <ul className="mt-0.5 ml-2 space-y-0.5 pl-3" style={{ borderLeft: '1px solid rgba(39,39,42,0.5)' }}>
                      <li>
                        <Link
                          href="/admin/pages/photography"
                          className={`sidebar-sub block rounded-md px-2 py-1.5 text-xs transition-colors ${
                            isActive('/admin/pages/photography') ? 'active' : ''
                          }`}
                        >
                          Photography
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/pages/film-motion"
                          className={`sidebar-sub block rounded-md px-2 py-1.5 text-xs transition-colors ${
                            isActive('/admin/pages/film-motion') ? 'active' : ''
                          }`}
                        >
                          Film & Motion
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/pages/art-direction"
                          className={`sidebar-sub block rounded-md px-2 py-1.5 text-xs transition-colors ${
                            isActive('/admin/pages/art-direction') ? 'active' : ''
                          }`}
                        >
                          Art Direction
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Contact */}
                <li>
                  <Link
                    href="/admin/pages/contact"
                    className={`sidebar-sub block rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                      isActive('/admin/pages/contact') ? 'active' : ''
                    }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Portfolio */}
          <li>
            <Link
              href="/admin/projects"
              className={`sidebar-link flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive('/admin/projects') ? 'active' : ''
              }`}
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              Portfolio
            </Link>
          </li>

          {/* Paramètres */}
          <li>
            <Link
              href="/admin/settings"
              className={`sidebar-link flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive('/admin/settings') ? 'active' : ''
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Paramètres de base
            </Link>
          </li>

        </ul>
      </nav>

      {/* Logout - at the very bottom */}
      <div className="px-6 pb-6">
        <button
          onClick={handleLogout}
          className="sidebar-logout flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
