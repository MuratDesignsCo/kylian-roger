import { redirect } from 'next/navigation'

export default function HomepageRedirect() {
  redirect('/admin/pages/home')
}
