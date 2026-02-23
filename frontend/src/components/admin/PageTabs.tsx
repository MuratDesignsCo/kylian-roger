'use client'

interface PageTabsProps {
  activeTab: 'content' | 'seo'
  onTabChange: (tab: 'content' | 'seo') => void
}

const tabs = [
  { key: 'content' as const, label: 'Contenu' },
  { key: 'seo' as const, label: 'SEO' },
]

export default function PageTabs({ activeTab, onTabChange }: PageTabsProps) {
  return (
    <div className="page-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={activeTab === tab.key ? 'active' : ''}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
