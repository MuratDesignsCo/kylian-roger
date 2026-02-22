import '@/styles/admin.css'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-root">
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '0.8125rem',
            fontFamily: '"Bdogrotesk Vf", system-ui, sans-serif',
            letterSpacing: '-0.01em',
            borderRadius: '0',
            padding: '0.75rem 1.25rem',
          },
        }}
      />
    </div>
  )
}
