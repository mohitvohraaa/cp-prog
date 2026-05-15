'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { 
  Search, Filter, CheckCircle2, Circle, ExternalLink, 
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp,
  Shuffle, Clock, BarChart2, Star
} from 'lucide-react'

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#00ff88',
  2: '#00f0ff', 
  3: '#f59e0b',
  4: '#ff6b35',
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
  4: 'Expert',
}

export function LadderView() {
  const { ladders, activeLadderId, stats, toggleProblem, updateProblem } = useStore()
  const activeLadder = ladders.find(l => l.id === activeLadderId)
  
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null)
  const [showSolved, setShowSolved] = useState<'all' | 'solved' | 'unsolved'>('all')
  const [sortBy, setSortBy] = useState<'index' | 'difficulty'>('index')
  const [showBookmarked, setShowBookmarked] = useState(false)

  const filteredProblems = useMemo(() => {
    if (!activeLadder) return []
    
    let problems = [...activeLadder.problems]
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      problems = problems.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.id.includes(searchLower)
      )
    }
    
    // Difficulty filter
    if (difficultyFilter !== null) {
      problems = problems.filter(p => p.difficulty === difficultyFilter)
    }
    
    // Solved filter
    if (showSolved === 'solved') {
      problems = problems.filter(p => p.solvedAt)
    } else if (showSolved === 'unsolved') {
      problems = problems.filter(p => !p.solvedAt)
    }
    
    // Bookmarked filter
    if (showBookmarked) {
      problems = problems.filter(p => p.bookmarked)
    }
    
    // Sort
    if (sortBy === 'difficulty') {
      problems.sort((a, b) => a.difficulty - b.difficulty)
    } else {
      problems.sort((a, b) => a.index - b.index)
    }
    
    return problems
  }, [activeLadder, search, difficultyFilter, showSolved, sortBy, showBookmarked])

  const handleToggle = (problemId: string) => {
    if (activeLadderId) {
      toggleProblem(activeLadderId, problemId)
    }
  }

  const handleBookmark = (problemId: string, currentState: boolean) => {
    if (activeLadderId) {
      updateProblem(activeLadderId, problemId, { bookmarked: !currentState })
    }
  }

  const pickRandom = () => {
    const unsolved = activeLadder?.problems.filter(p => !p.solvedAt) || []
    if (unsolved.length > 0) {
      const random = unsolved[Math.floor(Math.random() * unsolved.length)]
      const el = document.getElementById(`problem-${random.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-[#060b14]/90 backdrop-blur-xl border-b border-[#1e293b] pb-4 pt-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-[#00f0ff]">THE</span> GRIND
              <span className="text-sm font-normal text-[#64748b] bg-[#1e293b] px-2 py-0.5 rounded">
                {filteredProblems.length} / {activeLadder?.problems.length || 0}
              </span>
            </h2>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-white placeholder:text-[#64748b] text-sm focus:border-[#00f0ff]/50 focus:outline-none w-48 lg:w-64"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter ?? ''}
              onChange={(e) => setDifficultyFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-white text-sm focus:border-[#00f0ff]/50 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
              <option value="4">Expert</option>
            </select>

            {/* Solved Filter */}
            <select
              value={showSolved}
              onChange={(e) => setShowSolved(e.target.value as any)}
              className="px-3 py-2 bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-white text-sm focus:border-[#00f0ff]/50 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved</option>
            </select>

            {/* Sort */}
            <button
              onClick={() => setSortBy(sortBy === 'index' ? 'difficulty' : 'index')}
              className="flex items-center gap-2 px-3 py-2 bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-white text-sm hover:border-[#334155] transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-[#64748b]" />
              {sortBy === 'index' ? 'By Index' : 'By Difficulty'}
            </button>

            {/* Bookmark Filter */}
            <button
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`p-2 rounded-lg border transition-colors ${
                showBookmarked 
                  ? 'bg-[#f59e0b]/10 border-[#f59e0b]/50 text-[#f59e0b]' 
                  : 'bg-[#0a0f1a] border-[#1e293b] text-[#64748b] hover:text-[#f59e0b]'
              }`}
            >
              <Star className="w-4 h-4" fill={showBookmarked ? '#f59e0b' : 'none'} />
            </button>

            {/* Random Pick */}
            <button
              onClick={pickRandom}
              className="flex items-center gap-2 px-3 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg text-[#8b5cf6] text-sm hover:bg-[#8b5cf6]/20 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Random
            </button>
          </div>
        </div>
      </motion.div>

      {/* Problem List */}
      <div className="p-4 lg:p-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredProblems.map((problem, idx) => {
            const isSolved = !!problem.solvedAt
            const difficultyColor = DIFFICULTY_COLORS[problem.difficulty]
            
            return (
              <motion.div
                key={problem.id}
                id={`problem-${problem.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.02 }}
                layout
                className={`group relative bg-[#0a0f1a] border rounded-xl p-4 hover:border-[#334155] transition-all ${
                  isSolved 
                    ? 'border-[#00ff88]/20 hover:border-[#00ff88]/40' 
                    : 'border-[#1e293b]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(problem.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSolved 
                        ? 'bg-[#00ff88] border-[#00ff88]' 
                        : 'border-[#334155] hover:border-[#00f0ff]'
                    }`}
                  >
                    {isSolved && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[#060b14]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                    )}
                  </button>

                  {/* Problem Index */}
                  <div className="flex-shrink-0 w-10 text-center">
                    <span className={`text-lg font-bold ${isSolved ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>
                      {String(problem.index).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Problem Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${isSolved ? 'text-[#00ff88]/80 line-through' : 'text-white'}`}>
                        {problem.name}
                      </span>
                      {problem.bookmarked && (
                        <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {/* Difficulty Badge */}
                      <span 
                        className="text-xs px-2 py-0.5 rounded font-mono"
                        style={{ 
                          backgroundColor: `${difficultyColor}15`,
                          color: difficultyColor,
                          border: `1px solid ${difficultyColor}30`
                        }}
                      >
                        {DIFFICULTY_LABELS[problem.difficulty]}
                      </span>

                      {/* Tags would go here */}
                      {problem.tags.length > 0 && (
                        <div className="flex gap-1">
                          {problem.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] text-[#64748b] bg-[#1e293b] px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleBookmark(problem.id, problem.bookmarked)}
                      className="p-2 rounded-lg hover:bg-[#1e293b] text-[#64748b] hover:text-[#f59e0b] transition-colors"
                      title={problem.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      {problem.bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-[#f59e0b]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-[#1e293b] text-[#64748b] hover:text-[#00f0ff] transition-colors"
                      title="Open on Codeforces"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Solved indicator line */}
                {isSolved && (
                  <motion.div 
                    layoutId="solved-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[#00ff88]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1e293b] flex items-center justify-center">
              <Search className="w-8 h-8 text-[#64748b]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No problems found</h3>
            <p className="text-[#64748b]">Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}