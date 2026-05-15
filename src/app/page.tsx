'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { HeroSection } from '@/components/HeroSection'
import { LadderView } from '@/components/LadderView'
import { AnalyticsView } from '@/components/AnalyticsView'
import { CommandPalette } from '@/components/CommandPalette'
import { ImportModal } from '@/components/ImportModal'
import { Confetti } from '@/components/Confetti'
import { FocusTimer } from '@/components/FocusTimer'
import { 
  Terminal, LayoutGrid, BarChart3, Trophy, Zap, Command, 
  Menu, X, ChevronRight, Flame, Target, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [activeView, setActiveView] = useState<'hero' | 'ladder' | 'analytics'>('hero')
  const [commandOpen, setCommandOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiKey, setConfettiKey] = useState(0)
  const [timerOpen, setTimerOpen] = useState(false)
  
  const { stats, activeLadderId, ladders, getLevelInfo } = useStore()
  const levelInfo = getLevelInfo()
  const activeLadder = ladders.find(l => l.id === activeLadderId)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandOpen(false)
        setImportOpen(false)
      }
      if (e.key === '1' && !e.metaKey && !e.ctrlKey) setActiveView('hero')
      if (e.key === '2' && !e.metaKey && !e.ctrlKey) setActiveView('ladder')
      if (e.key === '3' && !e.metaKey && !e.ctrlKey) setActiveView('analytics')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Trigger confetti on milestone
  useEffect(() => {
    const milestones = [1, 10, 25, 50, 75, 100]
    if (milestones.includes(stats.totalSolved)) {
      setConfettiKey(prev => prev + 1)
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [stats.totalSolved])
  
  const navItems = [
    { id: 'hero' as const, label: 'Mission Control', icon: Terminal, shortcut: '1' },
    { id: 'ladder' as const, label: 'The Grind', icon: LayoutGrid, shortcut: '2' },
    { id: 'analytics' as const, label: 'Intel', icon: BarChart3, shortcut: '3' },
  ]
  
  return (
    <div className="flex h-screen overflow-hidden bg-[#060b14]">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && <Confetti key={confettiKey} />}
      </AnimatePresence>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0f1a] border-r border-[#1e293b] flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 ease-out`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#00ff88]/20 border border-[#00f0ff]/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">CP PROG</h1>
              <p className="text-[10px] text-[#64748b] font-mono tracking-widest uppercase">Elite Training</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20' 
                    : 'text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f0ff]' : 'text-[#64748b] group-hover:text-white'}`} />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] font-mono text-[#475569]">{item.shortcut}</span>
              </button>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-[#1e293b]">
            <button
              onClick={() => setTimerOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white transition-all"
            >
              <Clock className="w-4 h-4 text-[#8b5cf6]" />
              <span>Focus Timer</span>
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white transition-all mt-1"
            >
              <Zap className="w-4 h-4 text-[#64748b]" />
              <span>Import Ladder</span>
            </button>
          </div>
        </nav>
        
        {/* Active Ladder Info */}
        <div className="p-4 border-t border-[#1e293b]">
          <div className="text-[10px] font-mono text-[#475569] uppercase tracking-wider mb-2">Active Mission</div>
          <div className="text-sm font-medium text-white truncate">{activeLadder?.name || 'No Ladder'}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#64748b]">
            <Target className="w-3 h-3" />
            <span>{activeLadder?.problems.length || 0} targets</span>
          </div>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#060b14]/80 backdrop-blur-xl border-b border-[#1e293b]">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[#1e293b]/50"
              >
                <Menu className="w-5 h-5 text-[#94a3b8]" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-[#00ff88]/20 border border-[#00f0ff]/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#00f0ff]">{levelInfo.level}</span>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-mono text-[#64748b]">LVL {levelInfo.level}</div>
                    <div className="w-24 h-1.5 bg-[#1e293b] rounded-full mt-0.5 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff88]"
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-[#00ff88]">
                    <Target className="w-3.5 h-3.5" />
                    <span className="font-mono font-semibold">{stats.totalSolved}/{stats.totalProblems}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#ffb800]">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="font-mono font-semibold">{stats.streak}d</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1420] border border-[#1e293b] text-[#64748b] hover:text-white hover:border-[#334155] transition-all text-sm"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Command</span>
              <kbd className="hidden sm:inline text-[10px] font-mono bg-[#1e293b] px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          </div>
          
          {/* Breadcrumb / View indicator */}
          <div className="px-4 lg:px-8 pb-3 flex items-center gap-2 text-xs text-[#64748b]">
            <span className="font-mono">CP-PROG</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#00f0ff]">{navItems.find(n => n.id === activeView)?.label}</span>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-8"
            >
              {activeView === 'hero' && <HeroSection onNavigate={setActiveView} />}
              {activeView === 'ladder' && <LadderView />}
              {activeView === 'analytics' && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Modals */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onNavigate={setActiveView} onOpenTimer={() => setTimerOpen(true)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <FocusTimer isOpen={timerOpen} onClose={() => setTimerOpen(false)} />
    </div>
  )
}
