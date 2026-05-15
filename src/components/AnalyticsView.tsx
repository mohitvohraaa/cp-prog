'use client'

import { useStore } from '@/lib/store'
import { CircularProgress } from './CircularProgress'
import { Heatmap } from './Heatmap'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  Trophy, Zap, Flame, Target, Award, Crown, Star, 
  Lock, Unlock, TrendingUp, Clock, Calendar, BookOpen,
  ChevronRight, X
} from 'lucide-react'

interface AchievementData {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Math': ['number', 'sum', 'prime', 'divisible', 'factor', 'factorial', 'gcd', 'mod', 'power', 'digit'],
  'String': ['string', 'word', 'character', 'palindrome', 'letter', 'text'],
  'Greedy': ['greedy', 'maximum', 'minimum', 'best', 'optimal', 'maximize', 'minimize'],
  'Implementation': ['print', 'output', 'calculate', 'read', 'input', 'sequence'],
  'DP': ['dp', 'sequence', 'subsequence', 'knapsack', 'edit'],
  'Sorting': ['sort', 'order', 'arrange', 'permutation'],
}

function inferTopic(problemName: string): string[] {
  const nameLower = problemName.toLowerCase()
  const topics: string[] = []
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      topics.push(topic)
    }
  }
  
  return topics.length > 0 ? topics : ['Implementation']
}

export function AnalyticsView() {
  const { stats, ladders, activeLadderId, getAchievements } = useStore()
  const activeLadder = ladders.find(l => l.id === activeLadderId)
  const achievements = getAchievements()
  
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null)

  const completionPercent = stats.totalProblems > 0 
    ? Math.round((stats.totalSolved / stats.totalProblems) * 100) 
    : 0

  // Calculate topic stats
  const topicStats = (() => {
    const result: Record<string, { solved: number; total: number }> = {}
    
    activeLadder?.problems.forEach(p => {
      const topics = inferTopic(p.name)
      topics.forEach(topic => {
        if (!result[topic]) result[topic] = { solved: 0, total: 0 }
        result[topic].total++
        if (p.solvedAt) result[topic].solved++
      })
    })
    
    return result
  })()

  // Difficulty breakdown
  const difficultyData = [1, 2, 3, 4].map(diff => {
    const total = activeLadder?.problems.filter(p => p.difficulty === diff).length || 0
    const solved = stats.difficultyBreakdown[diff] || 0
    return { difficulty: diff, solved, total, percent: total > 0 ? Math.round((solved / total) * 100) : 0 }
  })

  // Achievement stats
  const unlockedAchievements = achievements.filter(a => stats.achievements.includes(a.id))
  const achievementProgress = Math.round((unlockedAchievements.length / achievements.length) * 100)

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-[#00f0ff]">INTEL</span> DASHBOARD
        </h2>
        <p className="text-[#64748b] mt-1">Track your progress and achievements</p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Circular Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6 flex flex-col items-center"
        >
          <CircularProgress 
            percentage={completionPercent}
            size={180}
            strokeWidth={12}
            color="#00f0ff"
            label={<span className="text-3xl font-bold text-white">{completionPercent}%</span>}
            sublabel="COMPLETE"
          />
          <div className="mt-4 text-center">
            <div className="text-[#94a3b8]">
              {stats.totalSolved} of {stats.totalProblems} problems dominated
            </div>
          </div>
        </motion.div>

        {/* XP & Level */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00ff88]" />
            Experience & Level
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#64748b]">Total XP</span>
              <span className="text-2xl font-bold text-[#00ff88]">{stats.xp.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[#64748b]">Current Level</span>
              <span className="text-2xl font-bold text-white">{stats.level}</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#64748b]">Progress to next level</span>
                <span className="text-[#00f0ff]">Level {stats.level + 1}</span>
              </div>
              <div className="h-3 bg-[#1e293b] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff88]"
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1e293b]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#f59e0b]">{stats.streak}</div>
                <div className="text-xs text-[#64748b]">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ff6b35]">{stats.longestStreak}</div>
                <div className="text-xs text-[#64748b]">Best Streak</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#f59e0b]" />
            Achievements
          </h3>
          
          <div className="flex items-center justify-center mb-4">
            <CircularProgress 
              percentage={achievementProgress}
              size={120}
              strokeWidth={8}
              color="#f59e0b"
              label={<span className="text-xl font-bold text-white">{unlockedAchievements.length}</span>}
              sublabel={`/ ${achievements.length}`}
            />
          </div>
          
          <div className="text-center text-sm text-[#94a3b8]">
            {achievementProgress === 100 
              ? '🏆 All achievements unlocked!' 
              : `${achievements.length - unlockedAchievements.length} more to unlock`
            }
          </div>
        </motion.div>
      </div>

      {/* Difficulty Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00f0ff]" />
          Difficulty Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {difficultyData.map(({ difficulty, solved, total, percent }) => {
            const colors = ['#00ff88', '#00f0ff', '#f59e0b', '#ff6b35']
            const labels = ['Easy', 'Medium', 'Hard', 'Expert']
            
            return (
              <div key={difficulty} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748b]">{labels[difficulty - 1]}</span>
                  <span className="text-sm font-mono text-white">{solved}/{total}</span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors[difficulty - 1] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="text-xs text-right" style={{ color: colors[difficulty - 1] }}>
                  {percent}%
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6 mb-6"
      >
        <Heatmap />
      </motion.div>

      {/* Topic Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8b5cf6]" />
          Topic Coverage
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(topicStats).map(([topic, { solved, total }]) => {
            const percent = total > 0 ? Math.round((solved / total) * 100) : 0
            const colors: Record<string, string> = {
              'Math': '#00ff88',
              'String': '#00f0ff',
              'Greedy': '#f59e0b',
              'Implementation': '#8b5cf6',
              'DP': '#ff6b35',
              'Sorting': '#ec4899',
            }
            
            return (
              <div key={topic} className="text-center p-3 bg-[#0f1420] rounded-xl">
                <div className="text-sm font-medium text-white mb-1">{topic}</div>
                <div className="text-xs text-[#64748b] mb-2">{solved}/{total}</div>
                <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors[topic] || '#64748b' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Achievements Gallery */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#f59e0b]" />
          Achievement Gallery
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {achievements.map((ach, idx) => {
            const isUnlocked = stats.achievements.includes(ach.id)
            
            return (
              <motion.button
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
                onClick={() => setSelectedAchievement({
                  id: ach.id,
                  title: ach.title,
                  description: ach.description,
                  icon: ach.icon,
                  unlocked: isUnlocked,
                  unlockedAt: isUnlocked ? new Date().toISOString() : null
                })}
                className={`relative p-4 rounded-xl border transition-all ${
                  isUnlocked 
                    ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:border-[#f59e0b]/60' 
                    : 'bg-[#0f1420] border-[#1e293b] hover:border-[#334155]'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                  isUnlocked ? 'bg-[#f59e0b]/20' : 'bg-[#1e293b]'
                }`}>
                  {isUnlocked ? (
                    <Award className="w-6 h-6 text-[#f59e0b]" />
                  ) : (
                    <Lock className="w-5 h-5 text-[#475569]" />
                  )}
                </div>
                <div className={`text-sm font-medium ${isUnlocked ? 'text-white' : 'text-[#64748b]'}`}>
                  {ach.title}
                </div>
                <div className="text-[10px] text-[#475569] mt-1">
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Achievement Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0f1a] border border-[#1e293b] rounded-2xl p-8 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#1e293b] text-[#64748b]"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                selectedAchievement.unlocked 
                  ? 'bg-[#f59e0b]/20' 
                  : 'bg-[#1e293b]'
              }`}>
                {selectedAchievement.unlocked ? (
                  <Award className="w-10 h-10 text-[#f59e0b]" />
                ) : (
                  <Lock className="w-8 h-8 text-[#475569]" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                {selectedAchievement.title}
              </h3>
              
              <p className="text-[#94a3b8] text-center mb-4">
                {selectedAchievement.description}
              </p>
              
              {selectedAchievement.unlocked && (
                <div className="text-center text-sm text-[#00ff88]">
                  ✓ Unlocked
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}