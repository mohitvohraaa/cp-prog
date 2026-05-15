import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Ladder, Problem, UserStats, Achievement, AppState } from './types'
import { generateId, getTodayKey, getYesterdayKey, calculateLevel, xpForDifficulty, getLevelProgress } from './utils'
import { parseA2OJMarkdownTable } from './parser'

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', title: 'First Blood', description: 'Solve your first problem', icon: 'Zap', unlockedAt: null, condition: (s) => s.totalSolved >= 1 },
  { id: '10-club', title: 'Decade', description: 'Solve 10 problems', icon: 'Target', unlockedAt: null, condition: (s) => s.totalSolved >= 10 },
  { id: '25-club', title: 'Quarter Century', description: 'Solve 25 problems', icon: 'Trophy', unlockedAt: null, condition: (s) => s.totalSolved >= 25 },
  { id: '50-club', title: '50 Problems Club', description: 'Solve 50 problems', icon: 'Award', unlockedAt: null, condition: (s) => s.totalSolved >= 50 },
  { id: '75-club', title: 'Three Quarters', description: 'Solve 75 problems', icon: 'Crown', unlockedAt: null, condition: (s) => s.totalSolved >= 75 },
  { id: '100-club', title: 'Centurion', description: 'Solve 100 problems', icon: 'Star', unlockedAt: null, condition: (s) => s.totalSolved >= 100 },
  { id: 'streak-3', title: 'On Fire', description: '3 day streak', icon: 'Flame', unlockedAt: null, condition: (s) => s.longestStreak >= 3 },
  { id: 'streak-7', title: 'Unstoppable', description: '7 day streak', icon: 'Flame', unlockedAt: null, condition: (s) => s.longestStreak >= 7 },
  { id: 'streak-30', title: 'Legendary', description: '30 day streak', icon: 'Flame', unlockedAt: null, condition: (s) => s.longestStreak >= 30 },
  { id: 'level-5', title: 'Rising Star', description: 'Reach level 5', icon: 'Rocket', unlockedAt: null, condition: (s) => s.level >= 5 },
  { id: 'level-10', title: 'Veteran', description: 'Reach level 10', icon: 'Shield', unlockedAt: null, condition: (s) => s.level >= 10 },
  { id: 'level-20', title: 'Grandmaster', description: 'Reach level 20', icon: 'Crown', unlockedAt: null, condition: (s) => s.level >= 20 },
  { id: 'diff-1-complete', title: 'Rookie', description: 'Complete all difficulty 1 problems', icon: 'Star', unlockedAt: null, condition: (s) => (s.difficultyBreakdown[1] || 0) >= 29 },
  { id: 'diff-2-complete', title: 'Apprentice', description: 'Complete all difficulty 2 problems', icon: 'Star', unlockedAt: null, condition: (s) => (s.difficultyBreakdown[2] || 0) >= 31 },
  { id: 'diff-3-complete', title: 'Competent', description: 'Complete all difficulty 3 problems', icon: 'Star', unlockedAt: null, condition: (s) => (s.difficultyBreakdown[3] || 0) >= 33 },
  { id: 'diff-4-complete', title: 'Prodigy', description: 'Complete all difficulty 4 problems', icon: 'Star', unlockedAt: null, condition: (s) => (s.difficultyBreakdown[4] || 0) >= 6 },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Solve 5 problems in one day', icon: 'Zap', unlockedAt: null, condition: (s) => Object.values(s.solveHistory).some(v => v >= 5) },
  { id: 'early-bird', title: 'Early Bird', description: 'Solve a problem before 8am', icon: 'Sun', unlockedAt: null, condition: () => false },
  { id: 'night-owl', title: 'Night Owl', description: 'Solve a problem after 10pm', icon: 'Moon', unlockedAt: null, condition: () => false },
  { id: 'comeback', title: 'Comeback Kid', description: 'Resume after 3+ day break', icon: 'RefreshCw', unlockedAt: null, condition: (s) => s.streak > 0 },
]

const DEFAULT_STATS: UserStats = {
  totalSolved: 0,
  totalProblems: 0,
  streak: 0,
  longestStreak: 0,
  lastSolvedDate: null,
  xp: 0,
  level: 1,
  difficultyBreakdown: {},
  solveHistory: {},
  achievements: [],
}

// Seed with A2OJ data
function createDefaultLadder(): Ladder {
  const rawData = `# Ladder Name: 11 - Codeforces Rating < 1300
## Description
For beginners, unrated users or users with Codeforces Rating < 1300.
## Difficulty Level: 2

| Checkbox | ID  | Problem Name | Online Judge | Difficulty |
|---|:---:|:---:|---|---|
|<ul><li>- [ ] Done</li></ul>|1|[Young Physicist](http://codeforces.com/problemset/problem/69/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|2|[Beautiful Matrix](http://codeforces.com/problemset/problem/263/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|3|[Queue at the School](http://codeforces.com/problemset/problem/266/B)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|4|[Borze](http://codeforces.com/problemset/problem/32/B)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|5|[Beautiful Year](http://codeforces.com/problemset/problem/271/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|6|[Lights Out](http://codeforces.com/problemset/problem/275/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|7|[Word](http://codeforces.com/problemset/problem/59/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|8|[Word Capitalization](http://codeforces.com/problemset/problem/281/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|9|[Nearly Lucky Number](http://codeforces.com/problemset/problem/110/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|10|[Stones on the Table](http://codeforces.com/problemset/problem/266/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|11|[Panoramix's Prediction](http://codeforces.com/problemset/problem/80/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|12|[Ultra-Fast Mathematician](http://codeforces.com/problemset/problem/61/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|13|[Perfect Permutation](http://codeforces.com/problemset/problem/233/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|14|[Arrival of the General](http://codeforces.com/problemset/problem/144/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|15|[Drinks](http://codeforces.com/problemset/problem/200/B)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|16|[Insomnia cure](http://codeforces.com/problemset/problem/148/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|17|[Cupboards](http://codeforces.com/problemset/problem/248/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|18|[I_love_\%username\%](http://codeforces.com/problemset/problem/155/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|19|[Tram](http://codeforces.com/problemset/problem/116/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|20|[Helpful Maths](http://codeforces.com/problemset/problem/339/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|21|[Is your horseshoe on the other hoof?](http://codeforces.com/problemset/problem/228/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|22|[Way Too Long Words](http://codeforces.com/problemset/problem/71/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|23|[Boy or Girl](http://codeforces.com/problemset/problem/236/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|24|[Amusing Joke](http://codeforces.com/problemset/problem/141/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|25|[Soft Drinking](http://codeforces.com/problemset/problem/151/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|26|[HQ9+](http://codeforces.com/problemset/problem/133/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|27|[Petya and Strings](http://codeforces.com/problemset/problem/112/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|28|[Team](http://codeforces.com/problemset/problem/231/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|29|[Bit++](http://codeforces.com/problemset/problem/282/A)|Codeforces|1|
|<ul><li>- [ ] Done</li></ul>|30|[Effective Approach](http://codeforces.com/problemset/problem/227/B)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|31|[Dima and Friends](http://codeforces.com/problemset/problem/272/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|32|[Jzzhu and Children](http://codeforces.com/problemset/problem/450/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|33|[Supercentral Point](http://codeforces.com/problemset/problem/165/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|34|[Petr and Book](http://codeforces.com/problemset/problem/139/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|35|[Parallelepiped](http://codeforces.com/problemset/problem/224/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|36|[Reconnaissance 2](http://codeforces.com/problemset/problem/34/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|37|[Even Odds](http://codeforces.com/problemset/problem/318/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|38|[Little Elephant and Rozdil](http://codeforces.com/problemset/problem/205/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|39|[Hexadecimal's theorem](http://codeforces.com/problemset/problem/199/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|40|[Jeff and Digits](http://codeforces.com/problemset/problem/352/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|41|[Xenia and Ringroad](http://codeforces.com/problemset/problem/339/B)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|42|[Magic Numbers](http://codeforces.com/problemset/problem/320/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|43|[Translation](http://codeforces.com/problemset/problem/41/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|44|[Football](http://codeforces.com/problemset/problem/43/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|45|[Bicycle Chain](http://codeforces.com/problemset/problem/215/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|46|[Sale](http://codeforces.com/problemset/problem/34/B)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|47|[System of Equations](http://codeforces.com/problemset/problem/214/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|48|[Business trip](http://codeforces.com/problemset/problem/149/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|49|[Dubstep](http://codeforces.com/problemset/problem/208/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|50|[k-String](http://codeforces.com/problemset/problem/219/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|51|[The number of positions](http://codeforces.com/problemset/problem/124/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|52|[Football](http://codeforces.com/problemset/problem/96/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|53|[String Task](http://codeforces.com/problemset/problem/118/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|54|[Little Elephant and Function](http://codeforces.com/problemset/problem/221/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|55|[Present from Lena](http://codeforces.com/problemset/problem/118/B)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|56|[Dragons](http://codeforces.com/problemset/problem/230/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|57|[Puzzles](http://codeforces.com/problemset/problem/337/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|58|[Chat room](http://codeforces.com/problemset/problem/58/A)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|59|[Airport](http://codeforces.com/problemset/problem/218/B)|Codeforces|2|
|<ul><li>- [ ] Done</li></ul>|60|[DZY Loves Chessboard](http://codeforces.com/problemset/problem/445/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|61|[Pashmak and Flowers](http://codeforces.com/problemset/problem/459/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|62|[Jeff and Periods](http://codeforces.com/problemset/problem/352/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|63|[Little Girl and Game](http://codeforces.com/problemset/problem/276/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|64|[Sail](http://codeforces.com/problemset/problem/298/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|65|[Shower Line](http://codeforces.com/problemset/problem/431/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|66|[Shooshuns and Sequence ](http://codeforces.com/problemset/problem/222/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|67|[Xenia and Divisors](http://codeforces.com/problemset/problem/342/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|68|[Letter](http://codeforces.com/problemset/problem/43/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|69|[Kitahara Haruki's Gift](http://codeforces.com/problemset/problem/433/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|70|[Comparing Strings](http://codeforces.com/problemset/problem/186/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|71|[Hungry Sequence](http://codeforces.com/problemset/problem/327/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|72|[Big Segment](http://codeforces.com/problemset/problem/242/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|73|[Little Elephant and Bits](http://codeforces.com/problemset/problem/258/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|74|[Yaroslav and Permutations](http://codeforces.com/problemset/problem/296/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|75|[Fence](http://codeforces.com/problemset/problem/363/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|76|[TL](http://codeforces.com/problemset/problem/350/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|77|[Increase and Decrease](http://codeforces.com/problemset/problem/246/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|78|[Two Bags of Potatoes](http://codeforces.com/problemset/problem/239/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|79|[Unlucky Ticket](http://codeforces.com/problemset/problem/160/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|80|[Boys and Girls](http://codeforces.com/problemset/problem/253/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|81|[Easy Number Challenge](http://codeforces.com/problemset/problem/236/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|82|[Pythagorean Theorem II](http://codeforces.com/problemset/problem/304/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|83|[Cards with Numbers](http://codeforces.com/problemset/problem/254/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|84|[Domino](http://codeforces.com/problemset/problem/353/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|85|[Cinema Line](http://codeforces.com/problemset/problem/349/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|86|[Rank List](http://codeforces.com/problemset/problem/166/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|87|[Cut Ribbon](http://codeforces.com/problemset/problem/189/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|88|[IQ Test](http://codeforces.com/problemset/problem/287/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|89|[Building Permutation](http://codeforces.com/problemset/problem/285/C)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|90|[Kuriyama Mirai's Stones](http://codeforces.com/problemset/problem/433/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|91|[T-primes](http://codeforces.com/problemset/problem/230/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|92|[Sereja and Suffixes](http://codeforces.com/problemset/problem/368/B)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|93|[Flipping Game](http://codeforces.com/problemset/problem/327/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|94|[Free Cash](http://codeforces.com/problemset/problem/237/A)|Codeforces|3|
|<ul><li>- [ ] Done</li></ul>|95|[Polo the Penguin and Matrix](http://codeforces.com/problemset/problem/289/B)|Codeforces|4|
|<ul><li>- [ ] Done</li></ul>|96|[Jzzhu and Sequences](http://codeforces.com/problemset/problem/450/B)|Codeforces|4|
|<ul><li>- [ ] Done</li></ul>|97|[Appleman and Card Game](http://codeforces.com/problemset/problem/462/B)|Codeforces|4|
|<ul><li>- [ ] Done</li></ul>|98|[Sort the Array](http://codeforces.com/problemset/problem/451/B)|Codeforces|4|
|<ul><li>- [ ] Done</li></ul>|99|[Sereja and Bottles](http://codeforces.com/problemset/problem/315/A)|Codeforces|4|
|<ul><li>- [ ] Done</li></ul>|100|[Adding Digits](http://codeforces.com/problemset/problem/260/A)|Codeforces|4|`

  const ladder = parseA2OJMarkdownTable(rawData)
  if (!ladder) throw new Error('Failed to parse default ladder')
  ladder.isDefault = true
  return ladder
}

interface StoreState extends AppState {
  toggleProblem: (ladderId: string, problemId: string) => void
  addLadder: (ladder: Ladder) => void
  removeLadder: (ladderId: string) => void
  setActiveLadder: (ladderId: string) => void
  renameLadder: (ladderId: string, name: string, description: string) => void
  updateProblem: (ladderId: string, problemId: string, updates: Partial<Problem>) => void
  getAchievements: () => Achievement[]
  getStats: () => UserStats
  getLevelInfo: () => ReturnType<typeof getLevelProgress>
  resetProgress: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ladders: [createDefaultLadder()],
      activeLadderId: createDefaultLadder().id,
      stats: { ...DEFAULT_STATS, totalProblems: 100 },
      preferences: {
        soundEnabled: false,
        focusMode: false,
        viewMode: 'grid',
      },

      toggleProblem: (ladderId, problemId) => {
        const state = get()
        const ladder = state.ladders.find(l => l.id === ladderId)
        if (!ladder) return

        const problem = ladder.problems.find(p => p.id === problemId)
        if (!problem) return

        const now = new Date().toISOString()
        const today = getTodayKey()
        const wasSolved = !!problem.solvedAt

        const newSolvedAt = wasSolved ? null : now
        const xpDelta = wasSolved ? -xpForDifficulty(problem.difficulty) : xpForDifficulty(problem.difficulty)

        const newLadders = state.ladders.map(l => {
          if (l.id !== ladderId) return l
          return {
            ...l,
            problems: l.problems.map(p =>
              p.id === problemId
                ? { ...p, solvedAt: newSolvedAt }
                : p
            ),
            updatedAt: now,
          }
        })

        const totalSolved = newLadders.reduce(
          (acc, l) => acc + l.problems.filter(p => p.solvedAt).length,
          0
        )

        const newHistory = { ...state.stats.solveHistory }
        if (!wasSolved) {
          newHistory[today] = (newHistory[today] || 0) + 1
        } else {
          newHistory[today] = Math.max(0, (newHistory[today] || 0) - 1)
        }

        const yesterday = getYesterdayKey()
        let streak = state.stats.streak
        if (!wasSolved) {
          if (state.stats.lastSolvedDate === today) {
            streak = state.stats.streak
          } else if (state.stats.lastSolvedDate === yesterday) {
            streak = state.stats.streak + 1
          } else {
            streak = 1
          }
        }

        const newStats = {
          ...state.stats,
          totalSolved,
          xp: Math.max(0, state.stats.xp + xpDelta),
          level: calculateLevel(Math.max(0, state.stats.xp + xpDelta)),
          lastSolvedDate: wasSolved ? state.stats.lastSolvedDate : today,
          streak: wasSolved ? state.stats.streak : streak,
          longestStreak: Math.max(state.stats.longestStreak, streak),
          solveHistory: newHistory,
          difficultyBreakdown: newLadders.reduce((acc, l) => {
            l.problems.forEach(p => {
              if (p.solvedAt) {
                acc[p.difficulty] = (acc[p.difficulty] || 0) + 1
              }
            })
            return acc
          }, {} as Record<number, number>),
        }

        const updatedAchievements = DEFAULT_ACHIEVEMENTS.map(ach => {
          if (state.stats.achievements.includes(ach.id)) return ach
          if (ach.condition(newStats)) {
            return { ...ach, unlockedAt: now }
          }
          return ach
        })

        newStats.achievements = [
          ...state.stats.achievements,
          ...updatedAchievements
            .filter(a => a.unlockedAt && !state.stats.achievements.includes(a.id))
            .map(a => a.id),
        ]

        set({ ladders: newLadders, stats: newStats })
      },

      addLadder: (ladder) => {
        const state = get()
        set({
          ladders: [...state.ladders, ladder],
          activeLadderId: ladder.id,
          stats: {
            ...state.stats,
            totalProblems: state.stats.totalProblems + ladder.problems.length,
          },
        })
      },

      removeLadder: (ladderId) => {
        const state = get()
        const ladder = state.ladders.find(l => l.id === ladderId)
        if (!ladder || ladder.isDefault) return
        const newLadders = state.ladders.filter(l => l.id !== ladderId)
        set({
          ladders: newLadders,
          activeLadderId: state.activeLadderId === ladderId
            ? (newLadders.find(l => l.isDefault)?.id || newLadders[0]?.id || null)
            : state.activeLadderId,
          stats: {
            ...state.stats,
            totalProblems: state.stats.totalProblems - ladder.problems.length,
          },
        })
      },

      setActiveLadder: (ladderId) => {
        set({ activeLadderId: ladderId })
      },

      renameLadder: (ladderId, name, description) => {
        const state = get()
        set({
          ladders: state.ladders.map(l =>
            l.id === ladderId ? { ...l, name, description, updatedAt: new Date().toISOString() } : l
          ),
        })
      },

      updateProblem: (ladderId, problemId, updates) => {
        const state = get()
        set({
          ladders: state.ladders.map(l => {
            if (l.id !== ladderId) return l
            return {
              ...l,
              problems: l.problems.map(p =>
                p.id === problemId ? { ...p, ...updates } : p
              ),
            }
          }),
        })
      },

      getAchievements: () => {
        return DEFAULT_ACHIEVEMENTS
      },

      getStats: () => get().stats,

      getLevelInfo: () => getLevelProgress(get().stats.xp),

      resetProgress: () => {
        const state = get()
        set({
          ladders: state.ladders.map(l => ({
            ...l,
            problems: l.problems.map(p => ({ ...p, solvedAt: null })),
          })),
          stats: { ...DEFAULT_STATS, totalProblems: state.stats.totalProblems },
        })
      },
    }),
    {
      name: 'cp-prog-storage',
    }
  )
)
