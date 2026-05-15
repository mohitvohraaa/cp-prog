'use client'

import { useStore } from '@/lib/store'
import { CircularProgress } from './CircularProgress'
import { motion } from 'framer-motion'
import { 
  Target, Flame, Zap, Trophy, ChevronRight, 
  Brain, Timer, Sparkles, Crosshair, Ghost, Moon, Sun
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  onNavigate: (view: 'hero' | 'ladder' | 'analytics') => void
}

const LEVEL_TITLES = [
  { minLevel: 1, maxLevel: 4, title: 'Hunter', rank: 'E' },
  { minLevel: 5, maxLevel: 9, title: 'Hunter', rank: 'D' },
  { minLevel: 10, maxLevel: 19, title: 'Hunter', rank: 'C' },
  { minLevel: 20, maxLevel: 29, title: 'Hunter', rank: 'B' },
  { minLevel: 30, maxLevel: 39, title: 'Hunter', rank: 'A' },
  { minLevel: 40, maxLevel: 49, title: 'Hunter', rank: 'S' },
  { minLevel: 50, maxLevel: 999, title: 'Grandmaster', rank: '★' },
]

function getLevelTitle(level: number) {
  return LEVEL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel) || LEVEL_TITLES[0]
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = value
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(eased * end))
      
      if (progress < 1) requestAnimationFrame(animate)
    }
    
    animate()
  }, [value, duration])
  
  return <span>{displayValue}</span>
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { stats, activeLadderId, ladders, getLevelInfo } = useStore()
  const activeLadder = ladders.find(l => l.id === activeLadderId)
  const levelInfo = getLevelInfo()
  const levelMeta = getLevelTitle(levelInfo.level)
  
  const remaining = stats.totalProblems - stats.totalSolved
  const completionPercent = stats.totalProblems > 0 
    ? Math.round((stats.totalSolved / stats.totalProblems) * 100) 
    : 0
  
  const motivationalMessages = [
    "You are " + remaining + " problems away from becoming dangerous.",
    remaining > 50 
      ? "The grind has just begun. " + remaining + " to go." 
      : remaining > 20 
        ? "You're making progress. " + remaining + " more." 
        : remaining > 10 
          ? "Almost there. Keep pushing!" 
          : remaining > 5 
            ? "So close! " + remaining + " more!" 
            : "Final stretch! You got this!",
    completionPercent >= 50 
      ? "Halfway there! You're building something great." 
      : completionPercent >= 75 
        ? "Three quarters done! The finish line is near."
        : "Keep pushing forward!",
    stats.streak > 0 
      ? `🔥 ${stats.streak} day streak! Don't break the chain!` 
      : "Start your streak today!"
  ]
  
  const [message, setMessage] = useState(motivationalMessages[0])
  
  useEffect(() => {
    const idx = Math.floor(Math.random() * motivationalMessages.length)
    setMessage(motivationalMessages[idx])
  }, [stats.totalSolved])

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00f0ff]/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{ 
            backgroundImage: `linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-mono mb-4">
            <Sparkles className="w-3 h-3" />
            <span>ELITE TRAINING PROTOCOL</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            <span className="text-[#00f0ff]">MISSION</span>
            <span className="text-[#64748b]">CONTROL</span>
          </h1>
          
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            {message}
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="relative bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6 flex flex-col items-center">
              <CircularProgress 
                percentage={completionPercent}
                size={160}
                strokeWidth={10}
                color="#00f0ff"
                label={<AnimatedCounter value={completionPercent} />}
                sublabel="% COMPLETE"
              />
              
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stats.totalSolved} />
                  <span className="text-[#64748b] text-lg">/{stats.totalProblems}</span>
                </div>
                <div className="text-xs text-[#64748b] font-mono mt-1">PROBLEMS DOMINATED</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {/* XP Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div>
                  <div className="text-xs text-[#64748b] font-mono">EXPERIENCE</div>
                  <div className="text-xl font-bold text-white"><AnimatedCounter value={stats.xp} /> XP</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00f0ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-xs text-[#64748b]">{Math.round(levelInfo.percentage)}%</span>
              </div>
            </motion.div>

            {/* Level Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div>
                  <div className="text-xs text-[#64748b] font-mono">RANK</div>
                  <div className="text-xl font-bold text-white">
                    {levelMeta.title} <span className="text-[#f59e0b]">{levelMeta.rank}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-[#94a3b8]">
                Level <span className="text-[#00f0ff] font-bold">{levelInfo.level}</span>
                <span className="text-[#64748b]"> • {levelInfo.current}/{levelInfo.required} XP</span>
              </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#ff6b35]" style={{ filter: stats.streak > 0 ? 'drop-shadow(0 0 8px #ff6b35)' : 'none' }} />
                </div>
                <div>
                  <div className="text-xs text-[#64748b] font-mono">STREAK</div>
                  <div className="text-xl font-bold text-white">
                    {stats.streak} <span className="text-sm text-[#64748b]">days</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-[#94a3b8]">
                Best: <span className="text-[#f59e0b]">{stats.longestStreak}</span> days
              </div>
            </motion.div>

            {/* Ladder Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="text-xs text-[#64748b] font-mono">ACTIVE LADDER</div>
                  <div className="text-xl font-bold text-white truncate">{activeLadder?.name || 'None'}</div>
                </div>
              </div>
              <div className="text-sm text-[#94a3b8]">
                {activeLadder?.problems.length || 0} problems
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button
            onClick={() => onNavigate('ladder')}
            className="group flex items-center gap-2 px-6 py-3 bg-[#00f0ff] text-[#060b14] rounded-xl font-semibold hover:bg-[#00f0ff]/90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#00f0ff]/25"
          >
            <Crosshair className="w-5 h-5" />
            Start Grinding
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-2 px-6 py-3 bg-[#0a0f1a] border border-[#1e293b] text-white rounded-xl font-semibold hover:border-[#00f0ff]/50 hover:bg-[#0f1420] transition-all"
          >
            <Trophy className="w-5 h-5 text-[#f59e0b]" />
            View Intel
          </button>
        </motion.div>

        {/* Difficulty Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00f0ff]" />
            Difficulty Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(diff => {
              const solved = stats.difficultyBreakdown[diff] || 0
              const total = activeLadder?.problems.filter(p => p.difficulty === diff).length || 0
              const percent = total > 0 ? Math.round((solved / total) * 100) : 0
              const colors = ['#00ff88', '#00f0ff', '#f59e0b', '#ff6b35']
              
              return (
                <div key={diff} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748b] font-mono">Difficulty {diff}</span>
                    <span className="text-white font-mono">{solved}/{total}</span>
                  </div>
                  <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors[diff - 1] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + diff * 0.1 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <p className="text-[#475569] text-sm font-mono">
            Press <kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-[#94a3b8]">⌘K</kbd> for command palette
            <span className="mx-2">•</span>
            Press <kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-[#94a3b8]">1</kbd> <kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-[#94a3b8]">2</kbd> <kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-[#94a3b8]">3</kbd> to navigate
          </p>
        </motion.div>
      </div>
    </div>
  )
}