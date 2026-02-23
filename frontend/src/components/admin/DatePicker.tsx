'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DatePickerProps {
  value: string // "YYYY-MM-DD" or ""
  onChange: (date: string) => void
  label?: string
  placeholder?: string
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Sélectionner une date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + 'T00:00:00')
    return new Date()
  })
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  // Sync viewDate when value changes externally
  useEffect(() => {
    if (value) setViewDate(new Date(value + 'T00:00:00'))
  }, [value])

  const selected = value ? new Date(value + 'T00:00:00') : null
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  // Adjust to Monday start (0 = Mon, 6 = Sun)
  const adjustedFirst = (firstDayOfWeek + 6) % 7

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const selectDate = (day: number) => {
    const d = new Date(year, month, day)
    const pad = (n: number) => String(n).padStart(2, '0')
    const str = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    onChange(str)
    setIsOpen(false)
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  const isSelected = (day: number) =>
    selected !== null &&
    selected.getDate() === day &&
    selected.getMonth() === month &&
    selected.getFullYear() === year

  const displayValue = selected
    ? selected.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
        <span className={displayValue ? 'flex-1 text-gray-900' : 'flex-1 text-gray-400'}>
          {displayValue || placeholder}
        </span>
        {value && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            className="shrink-0 rounded-full p-0.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Month/Year header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day names header */}
          <div className="mb-1 grid grid-cols-7">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: adjustedFirst }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {/* Day buttons */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
                    isSelected(day)
                      ? 'bg-black font-semibold text-white shadow-sm'
                      : isToday(day)
                        ? 'bg-gray-100 font-medium text-gray-900 hover:bg-gray-200'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
