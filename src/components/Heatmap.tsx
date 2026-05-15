'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns'
import { motion } from 'framer-motion'

export function Heatmap() {
  const { stats } = useStore()
  const today = new Date()
  
  // Generate last 84 days (12 weeks)
  const days = useMemo(() => {
    const result = []
    for (let i = 83; i >= 0; i--) {
      result.push(subDays(today, i))
    }
    return result
  }, [])
  
  const getIntensity = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    const count = stats.solveHistory[key] || 0
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 5) return 3
    return 4
  }
  
  const intensityColors = [
    'bg-[#1e293b]',      // 0
    'bg-[#00f0ff]/30',   // 1
    'bg-[#00f0ff]/50',   // 2
    'bg-[#00f0ff]/70',   // 3
    'bg-[#00f0ff]',      // 4+
  ]
  
  // Group by weeks
  const weeks = useMemo(() => {
    const result: Date[][] = []
    let currentWeek: Date[] = []
    days.forEach((day, idx) => {
      if (idx % 7 === 0 && currentWeek.length > 0) {
        result.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    })
    if (currentWeek.length > 0) result.push(currentWeek)
    return result
  }, [days])
  
  const monthLabels = useMemo(() => {
    const labels: { weekIndex: number; month: string }[] = []
    weeks.forEach((week, idx) => {
      const firstDay = week[0]
      if (firstDay.getDate() <= 7) {
        labels.push({ weekIndex: idx, month: format(firstDay, 'MMM') })
      }
    })
    return labels
  }, [weeks])
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Consistency Heatmap</h3>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#64748b]">Less</span>
          {intensityColors.map((color, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${color}`} />
          ))}
          <span className="text-[10px] text-[#64748b]">More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 pl-7">
            {monthLabels.map((label, i) => (
              <div key={i} className="text-[10px] text-[#64748b] font-mono" style={{ marginLeft: i === 0 ? 0 : `${label.weekIndex * 23 - 28}px` }}>
                {label.month}
              </div>
            ))}
          </div>
          
          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-2">
              {['Mon', 'Wed', 'Fri'].map(day => (
                <div key={day} className="h-[10px] flex items-center">
                  <span className="text-[8px] text-[#475569] font-mono w-5">{day}</span>
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => {
                    const intensity = getIntensity(day)
                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: weekIdx * 0.01 + dayIdx * 0.005 }}
                        className={`w-[10px] h-[10px] rounded-[2px] ${intensityColors[intensity]} ${intensity > 0 ? 'glow-cyan' : ''}`}
                        title={`${format(day, 'MMM dd, yyyy')}: ${stats.solveHistory[format(day, 'yyyy-MM-dd')] || 0} solves`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
