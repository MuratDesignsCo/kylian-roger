'use client'

import dynamic from 'next/dynamic'
import type { Project } from '@/lib/types'

const FilmCarousel = dynamic(
  () => import('@/components/public/film-motion/FilmCarousel'),
  { ssr: false, loading: () => <div style={{ height: '100vh' }} /> }
)

interface FilmMotionClientProps {
  projects: Project[]
}

export default function FilmMotionClient({ projects }: FilmMotionClientProps) {
  return <FilmCarousel projects={projects} />
}
