'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderOpen,
  Home,
  Mail,
  Search,
  Settings,
  LogOut,
} from 'lucide-react'
import type { Session } from '@supabase/supabase-js'

interface AdminSidebarProps {
  session: Session
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Projets', href: '/admin/projects', icon: FolderOpen },
  { label: 'Accueil', href: '/admin/homepage', icon: Home },
  { label: 'Contact', href: '/admin/contact', icon: Mail },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Param\u00e8tres', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="flex h-screen w-56 flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-800">
        <span className="text-sm font-semibold text-white tracking-wide">
          Kylian Roger
        </span>
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="border-t border-zinc-800 px-3 py-4">
        <p className="mb-3 truncate px-3 text-xs text-zinc-500">
          {session.user.email}
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          D\u00e9connexion
        </button>
      </div>
    </aside>
  )
}
