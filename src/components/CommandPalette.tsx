'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { Ladder, Problem } from '@/lib/types'
import { Search, Terminal, LayoutGrid, BarChart3, FileJson, FileSpreadsheet, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNavigate: (view: 'hero' | 'ladder' | 'analytics') => void
  onOpenTimer?: () => void
}

export function CommandPalette({ open, onClose, onNavigate, onOpenTimer }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { ladders, activeLadderId, setActiveLadder } = useStore()
  
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])
  
  const activeLadder = ladders.find(l => l.id === activeLadderId)
  
  const navCommands = [
    { id: 'hero', label: 'Mission Control', icon: Terminal, action: () => { onNavigate('hero'); onClose() } },
    { id: 'ladder', label: 'The Grind', icon: LayoutGrid, action: () => { onNavigate('ladder'); onClose() } },
    { id: 'analytics', label: 'Intel', icon: BarChart3, action: () => { onNavigate('analytics'); onClose() } },
    { id: 'timer', label: 'Focus Timer', icon: Clock, action: () => { onOpenTimer?.(); onClose() }, meta: 'Pomodoro' },
  ]
  
  const ladderCommands = ladders.map(l => ({
    id: `ladder-${l.id}`,
    label: `Switch to: ${l.name}`,
    icon: FileJson,
    action: () => { setActiveLadder(l.id); onClose() },
  }))
  
  const problemCommands: { id: string; label: string; icon: any; action: () => void; meta?: string }[] = activeLadder 
    ? activeLadder.problems
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
        .map(p => ({
          id: `problem-${p.id}`,
          label: `${p.index}. ${p.name}`,
          icon: FileSpreadsheet,
          action: () => { window.open(p.url, '_blank'); onClose() },
          meta: `Diff ${p.difficulty}`,
        }))
    : []
  
  const allCommands = query 
    ? [...problemCommands, ...ladderCommands.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))]
    : [...navCommands, ...ladderCommands]
  
  if (!open) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl mx-4 bg-[#0f1420] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e293b]">
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search problems, ladders, or navigate..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#475569] outline-none"
            />
            <kbd className="text-[10px] font-mono bg-[#1e293b] text-[#64748b] px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {allCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748b]">No results found</div>
            ) : (
              allCommands.map((cmd, idx) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-[#64748b]" />
                    <span className="flex-1">{cmd.label}</span>
                    {'meta' in cmd && <span className="text-xs text-[#475569] font-mono">{cmd.meta}</span>}
                  </button>
                )
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
