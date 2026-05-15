import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getYesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function calculateLevel(xp: number): number {
  let level = 1
  let req = 100
  while (xp >= req) {
    xp -= req
    level++
    req = Math.floor(req * 1.2)
  }
  return level
}

export function getLevelProgress(xp: number): { level: number; current: number; required: number; percentage: number } {
  let level = 1
  let req = 100
  let current = xp
  while (current >= req) {
    current -= req
    level++
    req = Math.floor(req * 1.2)
  }
  return { level, current, required: req, percentage: Math.min(100, (current / req) * 100) }
}

export function xpForDifficulty(difficulty: number): number {
  return difficulty * 10 + 10
}
