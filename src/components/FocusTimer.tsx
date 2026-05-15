'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, Settings, X, Clock, 
  Zap, Target, Flame, Volume2, VolumeX
} from 'lucide-react'

interface FocusTimerProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_TIMES = [5, 10, 15, 25, 30, 45, 60]

export function FocusTimer({ isOpen, onClose }: FocusTimerProps) {
  const { stats } = useStore()
  
  const [minutes, setMinutes] = useState(25)
  const [customMinutes, setCustomMinutes] = useState(25)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  const totalTime = minutes * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  useEffect(() => {
    setTimeLeft(minutes * 60)
    setCustomMinutes(minutes)
  }, [minutes])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setSessionComplete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartPause = () => {
    setIsRunning(!isRunning)
    setSessionComplete(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(minutes * 60)
    setSessionComplete(false)
  }

  const handleCustomTime = (val: number) => {
    setMinutes(val)
    setCustomMinutes(val)
    setIsRunning(false)
    setTimeLeft(val * 60)
    setSessionComplete(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0a0f1a] border border-[#1e293b] rounded-2xl p-8 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Focus Timer</h3>
                <p className="text-xs text-[#64748b]">Deep work session</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg hover:bg-[#1e293b] text-[#64748b] hover:text-white transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#1e293b] text-[#64748b] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="relative flex items-center justify-center mb-8">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={sessionComplete ? '#00ff88' : '#00f0ff'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 90}
                initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 90) * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
                style={{ filter: sessionComplete ? 'none' : 'drop-shadow(0 0 8px #00f0ff40)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {sessionComplete ? (
                <>
                  <Zap className="w-10 h-10 text-[#00ff88] mb-2" />
                  <span className="text-lg font-bold text-[#00ff88]">Session Complete!</span>
                  <span className="text-xs text-[#64748b]">+5 XP earned</span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold text-white font-mono">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs text-[#64748b] mt-1">
                    {isRunning ? 'Focus time' : 'Paused'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-[#1e293b] text-[#64748b] hover:text-white hover:bg-[#334155] transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleStartPause}
              className={`p-4 rounded-xl transition-all ${
                isRunning 
                  ? 'bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30 hover:bg-[#ff6b35]/30' 
                  : 'bg-[#00f0ff] text-[#060b14] hover:bg-[#00f0ff]/90'
              }`}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
          </div>

          {/* Time Presets */}
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_TIMES.map(time => (
              <button
                key={time}
                onClick={() => handleCustomTime(time)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
                  minutes === time && !isRunning
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
                    : 'bg-[#1e293b] text-[#64748b] hover:text-white'
                }`}
              >
                {time}m
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-[#64748b]">Custom:</span>
            <input
              type="number"
              min="1"
              max="120"
              value={customMinutes}
              onChange={(e) => {
                const val = Math.max(1, Math.min(120, parseInt(e.target.value) || 1))
                setCustomMinutes(val)
              }}
              onBlur={() => handleCustomTime(customMinutes)}
              className="w-16 px-2 py-1 bg-[#1e293b] border border-[#334155] rounded text-white text-sm font-mono text-center focus:border-[#00f0ff]/50 focus:outline-none"
            />
            <span className="text-xs text-[#64748b]">min</span>
          </div>

          {/* Session Stats */}
          {stats.streak > 0 && (
            <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-[#ff6b35]">
                <Flame className="w-4 h-4" />
                <span>{stats.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2 text-[#00ff88]">
                <Target className="w-4 h-4" />
                <span>{stats.totalSolved} solved</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}