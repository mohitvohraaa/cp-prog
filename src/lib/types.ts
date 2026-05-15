export interface Problem {
  id: string
  index: number
  name: string
  url: string
  difficulty: number
  tags: string[]
  ladderId: string
  solvedAt: string | null
  notes: string
  bookmarked: boolean
  timeSpent: number // in minutes
}

export interface Ladder {
  id: string
  name: string
  description: string
  problems: Problem[]
  createdAt: string
  updatedAt: string
  isDefault?: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  condition: (stats: UserStats) => boolean
}

export interface UserStats {
  totalSolved: number
  totalProblems: number
  streak: number
  longestStreak: number
  lastSolvedDate: string | null
  xp: number
  level: number
  difficultyBreakdown: Record<number, number>
  solveHistory: Record<string, number> // date -> count
  achievements: string[] // IDs of unlocked achievements
}

export interface AppState {
  ladders: Ladder[]
  activeLadderId: string | null
  stats: UserStats
  preferences: {
    soundEnabled: boolean
    focusMode: boolean
    viewMode: 'grid' | 'list'
  }
}
